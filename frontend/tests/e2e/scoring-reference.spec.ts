import { expect, test } from '@playwright/test'

test.describe('Scoring reference page', () => {
  test('authenticated user can reach pontuacao from the shell and contextual surfaces', async ({ page }) => {
    const uniqueSuffix = Date.now()

    await page.goto('/register')
    await page.locator('#displayName').fill(`Pontuacao ${uniqueSuffix}`)
    await page.locator('#email').fill(`pontuacao-${uniqueSuffix}@example.com`)
    await page.locator('#password').fill('durogolpe123')
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())

    await expect
      .poll(async () => {
        const cookies = await page.context().cookies()
        return cookies.some((cookie) => cookie.name === 'auth_token')
      })
      .toBe(true)

    await page.getByRole('button', { name: /abrir menu/i }).click()
    await page.getByRole('link', { name: /^pontuacao$/i }).click()
    await expect(page).toHaveURL(/\/pontuacao$/)
    await expect(page.getByRole('heading', { name: /como a pontuacao funciona/i })).toBeVisible()

    await page.goto('/outrights')
    await page.getByRole('link', { name: /ver regra da pontuacao/i }).click()
    await expect(page).toHaveURL(/\/pontuacao$/)

    await page.goto('/leagues/new')
    await page.locator('#league-name').fill(`Liga Pontuacao ${uniqueSuffix}`)
    await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit())
    await expect(page).toHaveURL(/\/leagues\/[^/]+$/)
    await page.getByRole('link', { name: /como pontua/i }).click()
    await expect(page).toHaveURL(/\/pontuacao$/)
  })
})
