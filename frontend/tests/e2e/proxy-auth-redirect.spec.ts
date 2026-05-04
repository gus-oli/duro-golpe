import { expect, test } from '@playwright/test'

test.describe('Proxy-aware auth redirects', () => {
  test('prefers the forwarded public origin for protected route redirects', async ({ request }) => {
    const response = await request.get('/matches', {
      headers: {
        'x-forwarded-host': 'duro-golpe.example.com',
        'x-forwarded-proto': 'https',
      },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(307)
    expect(response.headers().location).toBe(
      'https://duro-golpe.example.com/login?from=%2Fmatches',
    )
  })

  test('falls back to the direct local origin when proxy headers are absent', async ({
    request,
    baseURL,
  }) => {
    const response = await request.get('/matches', { maxRedirects: 0 })

    expect(response.status()).toBe(307)
    expect(response.headers().location).toBe(`${baseURL}/login?from=%2Fmatches`)
  })
})
