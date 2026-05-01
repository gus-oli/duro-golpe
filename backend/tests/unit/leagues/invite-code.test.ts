import { describe, it, expect } from 'vitest'
import { generateInviteCodePure } from '../../../src/leagues/invite-code-utils.js'

describe('generateInviteCodePure', () => {
  it('generates a code that is exactly 8 characters long', () => {
    const code = generateInviteCodePure()
    expect(code).toHaveLength(8)
  })

  it('generates a code using only alphanumeric characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCodePure()
      expect(code).toMatch(/^[A-Z0-9]+$/)
    }
  })

  it('generates different codes on repeated calls (collision probability)', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      codes.add(generateInviteCodePure())
    }
    // With 8 base64url chars from 6 random bytes, collision probability is negligible
    // Expect at least 990 unique codes out of 1000
    expect(codes.size).toBeGreaterThan(990)
  })

  it('generates uppercase codes', () => {
    const code = generateInviteCodePure()
    expect(code).toBe(code.toUpperCase())
  })
})
