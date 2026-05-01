import { test, expect } from '@playwright/test'

// E2E tests for Mural real-time push.
// Two browser contexts (User A + User B) in same league + match.

test.describe('Mural real-time push', () => {
  test('User B sees User A comment within 5 seconds without page reload', async ({ browser }) => {
    const leagueId = process.env.E2E_LEAGUE_ID ?? 'test-league-id'
    const matchId = process.env.E2E_MATCH_ID ?? 'test-match-id'
    const tokenA = process.env.E2E_AUTH_TOKEN_A ?? 'token-a'
    const tokenB = process.env.E2E_AUTH_TOKEN_B ?? 'token-b'

    // Open User A context
    const contextA = await browser.newContext()
    await contextA.addCookies([
      { name: 'auth_token', value: tokenA, domain: 'localhost', path: '/' },
    ])
    const pageA = await contextA.newPage()

    // Open User B context
    const contextB = await browser.newContext()
    await contextB.addCookies([
      { name: 'auth_token', value: tokenB, domain: 'localhost', path: '/' },
    ])
    const pageB = await contextB.newPage()

    // Both navigate to the mural
    const muralUrl = `/matches/${matchId}/mural/${leagueId}`
    await Promise.all([pageA.goto(muralUrl), pageB.goto(muralUrl)])

    // User A posts a comment
    const uniqueContent = `Vai Brasil! ${Date.now()}`
    await pageA.getByRole('textbox', { name: /comentário|mensagem/i }).fill(uniqueContent)
    await pageA.getByRole('button', { name: /enviar|postar/i }).click()

    // User B should see the comment within 5 seconds without navigation
    await expect(pageB.getByText(uniqueContent)).toBeVisible({ timeout: 5000 })
    await expect(pageB).toHaveURL(new RegExp(muralUrl))

    await contextA.close()
    await contextB.close()
  })
})
