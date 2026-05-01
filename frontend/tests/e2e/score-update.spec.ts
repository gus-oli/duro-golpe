import { test, expect } from '@playwright/test'

// E2E test for real-time score total update via WebSocket.
// TDD: must be RED before TotalScore + broadcaster wiring.

test.describe('Score total real-time update', () => {
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

  test('TotalScore component updates when score:total:updated is received', async ({ page }) => {
    await page.goto('/leagues')

    // Simulate score:total:updated WebSocket event
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('ws:test:inject', {
          detail: JSON.stringify({
            type: 'score:total:updated',
            totalPoints: 125,
            matchPoints: 125,
            outrightPoints: 0,
            progressPercent: 4.0,
            exactScoreCount: 5,
          }),
        }),
      )
    })

    // TotalScore component should reflect updated values
    await expect(page.getByText('125')).toBeVisible({ timeout: 2000 })
  })
})
