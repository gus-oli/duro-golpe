import { expect, test } from '@playwright/test'

test.describe('Hosted beta auth surface', () => {
  test('keeps Google login out of the supported login surface', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /esqueci minha senha/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /entrar com google/i })).toHaveCount(0)
  })
})
