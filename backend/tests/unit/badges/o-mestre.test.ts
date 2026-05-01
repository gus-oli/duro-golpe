import { describe, it, expect } from 'vitest'
import { shouldAwardOMestre } from '../../../src/badges/badge-rule-utils.js'

describe('O Mestre rule (pure logic)', () => {
  it('awards when consecutiveCorrect equals 5', () => {
    expect(shouldAwardOMestre({ consecutiveCorrect: 5 })).toBe(true)
  })

  it('does not award when consecutiveCorrect is 4', () => {
    expect(shouldAwardOMestre({ consecutiveCorrect: 4 })).toBe(false)
  })

  it('does not award when consecutiveCorrect is 0', () => {
    expect(shouldAwardOMestre({ consecutiveCorrect: 0 })).toBe(false)
  })

  it('awards when consecutiveCorrect exceeds 5 (10 consecutive)', () => {
    // Idempotency is handled by ON CONFLICT DO NOTHING in DB; logic still returns true
    expect(shouldAwardOMestre({ consecutiveCorrect: 10 })).toBe(true)
  })

  it('boundary: exactly 5 is the first qualifying point', () => {
    expect(shouldAwardOMestre({ consecutiveCorrect: 5 })).toBe(true)
    expect(shouldAwardOMestre({ consecutiveCorrect: 4 })).toBe(false)
  })
})
