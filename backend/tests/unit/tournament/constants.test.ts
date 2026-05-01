import { describe, expect, it } from 'vitest'
import {
  TOURNAMENT_MATCH_COUNT,
  TOURNAMENT_TEAM_COUNT,
  validateTournamentCounts,
} from '../../../src/tournament/constants.js'

describe('2026 tournament assumptions', () => {
  it('locks the launch tournament shape to 48 teams and 104 matches', () => {
    expect(TOURNAMENT_TEAM_COUNT).toBe(48)
    expect(TOURNAMENT_MATCH_COUNT).toBe(104)
  })

  it('accepts the expected 2026 counts', () => {
    expect(() => validateTournamentCounts({ teamCount: 48, matchCount: 104 })).not.toThrow()
  })

  it('rejects outdated 32-team assumptions', () => {
    expect(() => validateTournamentCounts({ teamCount: 32, matchCount: 104 })).toThrow(/48/i)
    expect(() => validateTournamentCounts({ teamCount: 48, matchCount: 64 })).toThrow(/104/i)
  })
})
