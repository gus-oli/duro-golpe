import { test, expect } from '@playwright/test'

test.describe('Live score WebSocket', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Live smoke runs as a single deterministic chromium gate.')
  test.setTimeout(60000)

  test('score updates in real-time without page reload after a live webhook', async ({ page, request }) => {
    const uniqueSuffix = Date.now()
    const email = `live-${uniqueSuffix}@example.com`
    const password = 'durogolpe123'
    const matchId = process.env.E2E_MATCH_ID ?? ''
    const webhookSecret = process.env.WEBHOOK_SECRET ?? ''

    if (!matchId) {
      throw new Error('E2E_MATCH_ID must be set for live score smoke')
    }

    if (!webhookSecret) {
      throw new Error('WEBHOOK_SECRET must be set for live score smoke')
    }

    await page.goto('/register')
    await page.waitForTimeout(1000)
    await page.locator('#displayName').fill(`Live Score ${uniqueSuffix}`)
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await expect(page.locator('#displayName')).toHaveValue(`Live Score ${uniqueSuffix}`)
    await expect(page.locator('#email')).toHaveValue(email)
    await expect(page.locator('#password')).toHaveValue(password)
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
    await expect(page.getByRole('region', { name: /placar ao vivo/i })).toBeVisible()
    await expect(page.getByLabel(/placar: 1 a 0/i)).toHaveCount(0)
    await page.waitForTimeout(2000)

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001'

    const response = await request.post(`${apiBaseUrl}/api/v1/webhooks/api-football`, {
      headers: { 'x-webhook-secret': webhookSecret },
      data: {
        fixture: {
          id: 900001,
          status: { short: '1H' },
        },
        goals: {
          home: 1,
          away: 0,
        },
      },
    })

    expect(response.ok()).toBeTruthy()
    await expect(page.getByLabel(/placar: 1 a 0/i)).toBeVisible({ timeout: 15000 })
  })
})
