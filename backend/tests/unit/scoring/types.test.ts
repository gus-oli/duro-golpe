import { describe, expect, it } from 'vitest'
import { MAX_THEORETICAL_POINTS } from '../../../src/scoring/types.js'
import { TOURNAMENT_MATCH_COUNT, TOURNAMENT_TEAM_COUNT } from '../../../src/tournament/constants.js'
import { OUTRIGHT_MARKET_TOTAL_POINTS } from '../../../src/outrights/catalog.js'

describe('launch scoring constants', () => {
  it('uses the 3270-point theoretical ceiling for the active 2026 rules', () => {
    expect(TOURNAMENT_TEAM_COUNT).toBe(48)
    expect(TOURNAMENT_MATCH_COUNT).toBe(104)
    expect(OUTRIGHT_MARKET_TOTAL_POINTS).toBe(670)
    expect(MAX_THEORETICAL_POINTS).toBe(3270)
    expect(MAX_THEORETICAL_POINTS).toBe(TOURNAMENT_MATCH_COUNT * 25 + OUTRIGHT_MARKET_TOTAL_POINTS)
  })
})
