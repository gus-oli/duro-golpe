import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Hosted auth surface contract', () => {
  it('keeps Google login out of the supported login screen', () => {
    const loginPage = readFileSync(
      resolve(process.cwd(), '../frontend/src/app/(auth)/login/page.tsx'),
      'utf-8',
    )

    expect(loginPage).toContain("href=\"/forgot-password\"")
    expect(loginPage).not.toContain('Entrar com Google')
    expect(loginPage).not.toContain('/api/v1/auth/google')
  })
})
