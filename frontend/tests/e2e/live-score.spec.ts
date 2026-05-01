import { test, expect } from '@playwright/test'

test.describe('Live score WebSocket', () => {
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
    await page.getByLabel(/nome/i).fill(`Live Score ${uniqueSuffix}`)
    await page.getByLabel(/e-mail/i).fill(email)
    await page.getByLabel(/senha/i).fill(password)
    await page.getByRole('button', { name: /criar conta/i }).click()
    await expect(page).toHaveURL(/\/matches$/)

    await page.goto(`/matches/${matchId}`)
    await expect(page.getByRole('region', { name: /placar ao vivo/i })).toBeVisible()
    await expect(page.getByLabel(/placar: 1 a 0/i)).toHaveCount(0)

    const response = await request.post('http://127.0.0.1:3001/api/v1/webhooks/api-football', {
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
