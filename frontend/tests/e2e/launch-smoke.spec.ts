import { execFileSync } from 'node:child_process'
import { test, expect } from '@playwright/test'

test.describe('Launch smoke core journey', () => {
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
    await page.getByLabel(/nome/i).fill(userA.name)
    await page.getByLabel(/e-mail/i).fill(userA.email)
    await page.getByLabel(/senha/i).fill(userA.password)
    await page.getByRole('button', { name: /criar conta/i }).click()
    await expect(page).toHaveURL(/\/matches$/)

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
    await page.getByLabel(/nome da liga/i).fill(`Liga Smoke ${uniqueSuffix}`)
    await page.getByRole('button', { name: /criar liga/i }).click()
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

    const pageB = await browser.newPage()
    await pageB.goto('/register')
    await pageB.getByLabel(/nome/i).fill(userB.name)
    await pageB.getByLabel(/e-mail/i).fill(userB.email)
    await pageB.getByLabel(/senha/i).fill(userB.password)
    await pageB.getByRole('button', { name: /criar conta/i }).click()
    await expect(pageB).toHaveURL(/\/matches$/)

    await pageB.goto('/leagues/join')
    await pageB.getByLabel(/codigo de convite|c.digo de convite/i).fill(inviteCode)
    await pageB.getByRole('button', { name: /entrar na liga/i }).click()
    await expect(pageB).toHaveURL(new RegExp(`/leagues/${leagueId}$`))
    await expect(pageB.getByText(userA.name)).toBeVisible()
    await expect(pageB.getByText(userB.name)).toBeVisible()

    await page.goto(`/leagues/${leagueId}`)
    await expect(page.getByText(userA.name)).toBeVisible()
    await expect(page.getByText(userB.name)).toBeVisible()

    execFileSync(
      'npm.cmd',
      ['--workspace=backend', 'run', 'outrights:resolve', '--', 'CHAMPION', 'Brazil'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe',
      },
    )

    await expect(page.getByText(/^120$/)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/120\s+pts/i)).toBeVisible({ timeout: 15000 })

    await pageB.close()
  })
})
