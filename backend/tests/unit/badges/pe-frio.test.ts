import { describe, it, expect } from 'vitest'
import { shouldAwardPeFrio } from '../../../src/badges/badge-rule-utils.js'

describe('Pé Frio rule (pure logic)', () => {
  it('awards when consecutiveIncorrect equals 5', () => {
    expect(shouldAwardPeFrio({ consecutiveIncorrect: 5 })).toBe(true)
  })

  it('does not award when consecutiveIncorrect is 4', () => {
    expect(shouldAwardPeFrio({ consecutiveIncorrect: 4 })).toBe(false)
  })

  it('does not award when consecutiveIncorrect is 0', () => {
    expect(shouldAwardPeFrio({ consecutiveIncorrect: 0 })).toBe(false)
  })

  it('awards when consecutiveIncorrect exceeds 5 (streak of 6)', () => {
    // Idempotency handled by ON CONFLICT DO NOTHING; logic still returns true
    expect(shouldAwardPeFrio({ consecutiveIncorrect: 6 })).toBe(true)
  })

  it('boundary: exactly 5 is the first qualifying point', () => {
    expect(shouldAwardPeFrio({ consecutiveIncorrect: 5 })).toBe(true)
    expect(shouldAwardPeFrio({ consecutiveIncorrect: 4 })).toBe(false)
  })
})
