import { test, expect } from '@playwright/test'

// E2E test for badge:awarded toast notification.
// TDD: must be RED before BadgeToast + layout wiring.

test.describe('Badge award toast notification', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'auth_token',
        value: process.env.E2E_AUTH_TOKEN ?? 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('BadgeToast appears when badge:awarded WebSocket event is received', async ({ page }) => {
    await page.goto('/matches')

    // Simulate badge:awarded WebSocket event
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('ws:test:inject', {
          detail: JSON.stringify({
            type: 'badge:awarded',
            badge: {
              type: 'O_MESTRE',
              labelPt: 'O Mestre',
              descriptionPt: 'Acertou o resultado de 5 partidas consecutivas',
              iconKey: 'badge-mestre',
              awardedAt: new Date().toISOString(),
            },
          }),
        }),
      )
    })

    // Toast should appear
    await expect(page.getByText('O Mestre')).toBeVisible({ timeout: 2000 })
    await expect(page.getByText('Acertou o resultado de 5 partidas consecutivas')).toBeVisible()

    // Toast should auto-dismiss after 5 seconds
    await expect(page.getByText('O Mestre')).not.toBeVisible({ timeout: 7000 })
  })
})
