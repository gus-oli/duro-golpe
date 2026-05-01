import { describe, it, expect } from 'vitest'
import { shouldAwardZebraHunter } from '../../../src/badges/badge-rule-utils.js'

describe('Zebra Hunter rule (pure logic)', () => {
  it('awards when isZebraMatch=true and tier is not TOTAL_MISS (WINNER_OR_DRAW)', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: true, tier: 'WINNER_OR_DRAW' })).toBe(true)
  })

  it('awards when isZebraMatch=true and tier is EXACT_SCORE', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: true, tier: 'EXACT_SCORE' })).toBe(true)
  })

  it('awards when isZebraMatch=true and tier is WINNER_AND_GOAL_DIFF', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: true, tier: 'WINNER_AND_GOAL_DIFF' })).toBe(true)
  })

  it('does not award when isZebraMatch=false even with correct tier', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: false, tier: 'WINNER_OR_DRAW' })).toBe(false)
  })

  it('does not award when tier is TOTAL_MISS on a zebra match', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: true, tier: 'TOTAL_MISS' })).toBe(false)
  })

  it('does not award when isZebraMatch=false and TOTAL_MISS', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: false, tier: 'TOTAL_MISS' })).toBe(false)
  })

  it('awards when ONE_TEAM_GOALS on a zebra match (partial correct still a win over 0)', () => {
    expect(shouldAwardZebraHunter({ isZebraMatch: true, tier: 'ONE_TEAM_GOALS' })).toBe(true)
  })
})
