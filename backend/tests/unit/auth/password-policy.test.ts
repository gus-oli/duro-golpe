import { describe, expect, it } from 'vitest'
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../src/auth/password-policy.js'

describe('password policy', () => {
  it('accepts passwords with lowercase, uppercase, number, symbol, and minimum length', () => {
    expect(isStrongPassword('DuroGolpe1!')).toBe(true)
  })

  it('rejects passwords missing any required category', () => {
    expect(isStrongPassword('durogolpe1!')).toBe(false)
    expect(isStrongPassword('DUROGOLPE1!')).toBe(false)
    expect(isStrongPassword('DuroGolpe!!')).toBe(false)
    expect(isStrongPassword('DuroGolpe1')).toBe(false)
    expect(isStrongPassword('Dg1!')).toBe(false)
  })

  it('keeps a user-facing validation message for weak passwords', () => {
    expect(PASSWORD_POLICY_MESSAGE).toMatch(/minúscula/i)
    expect(PASSWORD_POLICY_MESSAGE).toMatch(/maiúscula/i)
    expect(PASSWORD_POLICY_MESSAGE).toMatch(/número/i)
    expect(PASSWORD_POLICY_MESSAGE).toMatch(/símbolo/i)
  })
})
