import { expect, test } from '@playwright/test'

// E2E tests for league social feed near-realtime polling.
// Two browser contexts (User A + User B) in same league.

test.describe('Mural polling freshness', () => {
  test('User B sees User A comment without page reload after the polling window', async ({ browser }) => {
    const leagueId = process.env.E2E_LEAGUE_ID ?? 'test-league-id'
    const tokenA = process.env.E2E_AUTH_TOKEN_A ?? 'token-a'
    const tokenB = process.env.E2E_AUTH_TOKEN_B ?? 'token-b'

    const contextA = await browser.newContext()
    await contextA.addCookies([{ name: 'auth_token', value: tokenA, domain: 'localhost', path: '/' }])
    const pageA = await contextA.newPage()

    const contextB = await browser.newContext()
    await contextB.addCookies([{ name: 'auth_token', value: tokenB, domain: 'localhost', path: '/' }])
    const pageB = await contextB.newPage()

    const muralUrl = `/leagues/${leagueId}#social-feed`
    await Promise.all([pageA.goto(muralUrl), pageB.goto(muralUrl)])

    const uniqueContent = `Vai Brasil! ${Date.now()}`
    await pageA.getByRole('textbox', { name: /mensagem da liga/i }).fill(uniqueContent)
    await pageA.getByRole('button', { name: /enviar|postar/i }).click()

    await expect(pageB.getByText(uniqueContent)).toBeVisible({ timeout: 16000 })
    await expect(pageB).toHaveURL(new RegExp(`/leagues/${leagueId}`))

    await contextA.close()
    await contextB.close()
  })
})
