import { describe, expect, it } from 'vitest'
import { getPasswordPolicyStatus, isStrongPassword } from '../../src/lib/password-policy'

describe('frontend password policy', () => {
  it('accepts strong passwords', () => {
    expect(isStrongPassword('DuroGolpe1!')).toBe(true)
  })

  it('reports which requirements are missing', () => {
    const status = getPasswordPolicyStatus('durogolpe')
    expect(status.find((rule) => rule.id === 'length')?.passed).toBe(true)
    expect(status.find((rule) => rule.id === 'lowercase')?.passed).toBe(true)
    expect(status.find((rule) => rule.id === 'uppercase')?.passed).toBe(false)
    expect(status.find((rule) => rule.id === 'number')?.passed).toBe(false)
    expect(status.find((rule) => rule.id === 'symbol')?.passed).toBe(false)
  })
})
