import { execSync } from 'node:child_process'
import { test, expect } from '@playwright/test'

test.describe('Launch smoke core journey', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Launch smoke runs as a single deterministic chromium gate.')
  test.setTimeout(120000)

  test('covers onboarding, prediction persistence, league join, outrights, and outright-driven ranking updates', async ({
    browser,
    page,
  }) => {
    const uniqueSuffix = Date.now()
    const matchId = process.env.E2E_MATCH_ID ?? ''
    if (!matchId) {
      throw new Error('E2E_MATCH_ID must be set for launch smoke tests')
    }

    const userA = {
      name: `Smoke A ${uniqueSuffix}`,
      email: `smoke-a-${uniqueSuffix}@example.com`,
      password: 'durogolpe123',
    }
    const userB = {
      name: `Smoke B ${uniqueSuffix}`,
      email: `smoke-b-${uniqueSuffix}@example.com`,
      password: 'durogolpe123',
    }

    await page.goto('/register')
    await page.waitForTimeout(1000)
    await page.locator('#displayName').fill(userA.name)
    await page.locator('#email').fill(userA.email)
    await page.locator('#password').fill(userA.password)
    await expect(page.locator('#displayName')).toHaveValue(userA.name)
    await expect(page.locator('#email')).toHaveValue(userA.email)
    await expect(page.locator('#password')).toHaveValue(userA.password)
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())
    await expect
      .poll(async () => {
        const cookies = await page.context().cookies()
        return cookies.some((cookie) => cookie.name === 'auth_token')
      })
      .toBe(true)

    await page.goto('/matches')
    await expect(page).toHaveURL(/\/matches$/, { timeout: 15000 })

    await page.goto(`/matches/${matchId}`)
    await expect(page.getByText(/Brazil/i)).toBeVisible()
    await expect(page.getByText(/France/i)).toBeVisible()
    await page.getByRole('spinbutton', { name: /gols do time da casa/i }).fill('2')
    await page.getByRole('spinbutton', { name: /gols do time visitante/i }).fill('1')
    await page.getByRole('button', { name: /enviar palpite/i }).click()
    await expect(page.getByText(/palpite enviado/i)).toBeVisible()
    await page.reload()
    await expect(page.getByRole('spinbutton', { name: /gols do time da casa/i })).toHaveValue('2')
    await expect(page.getByRole('spinbutton', { name: /gols do time visitante/i })).toHaveValue('1')

    await page.goto('/leagues/new')
    await page.waitForTimeout(1000)
    await page.locator('#league-name').fill(`Liga Smoke ${uniqueSuffix}`)
    await expect(page.locator('#league-name')).toHaveValue(`Liga Smoke ${uniqueSuffix}`)
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())
    await expect(page).toHaveURL(/\/leagues\/[^/]+$/)

    const leagueUrl = page.url()
    const leagueId = leagueUrl.split('/').at(-1)
    if (!leagueId) {
      throw new Error('League ID missing from URL')
    }

    const inviteCode = (await page.locator('span.font-mono').first().textContent())?.trim()
    if (!inviteCode || inviteCode.length !== 8) {
      throw new Error(`Unexpected invite code: ${inviteCode ?? 'empty'}`)
    }

    await page.goto('/outrights')

    const championCard = page.locator('article').filter({ hasText: /Campe/i }).first()
    await championCard.getByRole('button', { name: 'Brazil' }).click()
    await championCard.getByRole('button', { name: /salvar aposta|atualizar aposta/i }).click()
    await expect(championCard.getByText(/salva com sucesso/i)).toBeVisible()

    const finalistsCard = page.locator('article').filter({ hasText: /Finalistas/i }).first()
    await finalistsCard.getByRole('button', { name: 'Brazil' }).click()
    await finalistsCard.getByRole('button', { name: 'France' }).click()
    await finalistsCard.getByRole('button', { name: /salvar aposta|atualizar aposta/i }).click()
    await expect(finalistsCard.getByText(/salva com sucesso/i)).toBeVisible()

    execSync('npm.cmd --workspace=backend run smoke:lock-outrights', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    })

    await page.reload()
    await expect(championCard.getByText(/encerrado/i)).toBeVisible()
    await expect(championCard.getByRole('button', { name: /salvar aposta|atualizar aposta/i })).toHaveCount(0)

    const lockedChampionRequest = await championCard.evaluate(async (card) => {
      const marketId = card.getAttribute('data-market-id')
      const selectedButton = card.querySelector<HTMLButtonElement>('button[data-option-id][class*="bg-green-600"]')
      const optionId = selectedButton?.getAttribute('data-option-id')
      if (!marketId || !optionId) {
        throw new Error('Champion market metadata not found')
      }

      const response = await fetch(`/api/outrights/${marketId}/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds: [optionId] }),
      })

      return {
        status: response.status,
        body: (await response.json()) as { message?: string },
      }
    })

    expect(lockedChampionRequest.status).toBe(403)
    expect(lockedChampionRequest.body.message).toMatch(/mercado encerrado/i)

    await page.goto(`/matches/${matchId}`)
    await expect(page.getByRole('spinbutton', { name: /gols do time da casa/i })).toBeEnabled()

    execSync(`npm.cmd --workspace=backend run smoke:lock-match -- ${matchId}`, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    })

    await expect(page.getByRole('spinbutton', { name: /gols do time da casa/i })).toBeDisabled({ timeout: 15000 })
    await expect(page.getByText(/palpites encerrados/i)).toBeVisible()

    const pageB = await browser.newPage()
    await pageB.goto('/register')
    await pageB.waitForTimeout(1000)
    await pageB.locator('#displayName').fill(userB.name)
    await pageB.locator('#email').fill(userB.email)
    await pageB.locator('#password').fill(userB.password)
    await expect(pageB.locator('#displayName')).toHaveValue(userB.name)
    await expect(pageB.locator('#email')).toHaveValue(userB.email)
    await expect(pageB.locator('#password')).toHaveValue(userB.password)
    await pageB.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())
    await expect
      .poll(async () => {
        const cookies = await pageB.context().cookies()
        return cookies.some((cookie) => cookie.name === 'auth_token')
      })
      .toBe(true)

    await pageB.goto('/matches')
    await expect(pageB).toHaveURL(/\/matches$/, { timeout: 15000 })

    await pageB.goto('/leagues/join')
    await pageB.waitForTimeout(1000)
    await pageB.locator('#invite-code').fill(inviteCode)
    await expect(pageB.locator('#invite-code')).toHaveValue(inviteCode)
    await pageB.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())
    await expect(pageB).toHaveURL(/\/leagues\/[^/]+$/)
    await expect(pageB.getByText(userA.name)).toBeVisible()
    await expect(pageB.getByText(userB.name)).toBeVisible()

    execSync('npm.cmd --workspace=backend run outrights:resolve -- CHAMPION Brazil', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    })

    await expect(pageB.getByText(/120\s+pts/i)).toBeVisible({ timeout: 15000 })

    await pageB.close()
  })
})
