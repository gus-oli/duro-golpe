import { test, expect } from '@playwright/test'

// TDD: These tests must be RED before T008-T010 implementation begins.
// They verify that WebSocket push updates lock state without page reload.

test.describe('Match Card lock UI via WebSocket', () => {
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

  test('inputs become disabled when match:status:changed LOCKED is received', async ({ page }) => {
    const matchId = process.env.E2E_MATCH_ID ?? 'test-match-id'
    await page.goto(`/matches/${matchId}`)

    // Before lock: numeric score inputs should be enabled
    const homeInput = page.getByRole('spinbutton', { name: /placar.*casa|gols.*casa/i }).first()
    await expect(homeInput).toBeEnabled()

    // Simulate WebSocket event by injecting into the page
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('ws:test:inject', {
          detail: JSON.stringify({
            type: 'match:status:changed',
            matchId: window.__TEST_MATCH_ID__,
            status: 'LOCKED',
          }),
        }),
      )
    })

    // After lock: inputs should be disabled
    await expect(homeInput).toBeDisabled()

    // Submit button should not be visible
    const submitButton = page.getByRole('button', { name: /salvar|enviar/i })
    await expect(submitButton).not.toBeVisible()

    // Lock indicator text should be present
    await expect(page.getByText('Palpites encerrados')).toBeVisible()

    // Page should not have navigated
    await expect(page).toHaveURL(new RegExp(`/matches/${matchId}`))
  })
})
