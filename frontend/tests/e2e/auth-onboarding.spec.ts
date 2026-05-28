import { test, expect } from '@playwright/test'

// TDD: this scenario should be RED before the launch-readiness auth and
// prediction-persistence implementation is complete.

test.describe('Launch onboarding and prediction persistence', () => {
  test('registers a user and persists a match prediction through refresh', async ({ page }) => {
    const uniqueSuffix = Date.now()
    const email = `launch-${uniqueSuffix}@example.com`
    const password = 'DuroGolpe1!'
    const matchId = process.env.E2E_MATCH_ID ?? 'test-match-id'

    await page.goto('/register')
    await page.getByLabel(/nome/i).fill('Launch Tester')
    await page.getByLabel(/e-mail/i).fill(email)
    await page.locator('#password').fill(password)
    await page.locator('#confirmPassword').fill(password)
    await page.getByRole('button', { name: /criar conta/i }).click()

    await expect(page).toHaveURL(/\/matches$/)

    await page.goto(`/matches/${matchId}`)
    await page.getByRole('spinbutton', { name: /gols do time da casa/i }).fill('2')
    await page.getByRole('spinbutton', { name: /gols do time visitante/i }).fill('1')
    await page.getByRole('button', { name: /enviar palpite/i }).click()

    await expect(page.getByText('Palpite enviado!')).toBeVisible()

    await page.reload()
    await expect(page.getByRole('spinbutton', { name: /gols do time da casa/i })).toHaveValue('2')
    await expect(page.getByRole('spinbutton', { name: /gols do time visitante/i })).toHaveValue('1')
    await expect(page.getByRole('button', { name: /atualizar palpite/i })).toBeVisible()
  })
})
