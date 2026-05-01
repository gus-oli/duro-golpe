import { describe, it, expect } from 'vitest'
import { calculateTier } from '../../../src/scoring/engine.js'

describe('calculateTier', () => {
  // ── Tier 1: EXACT_SCORE (25pts) ────────────────────────────────────────
  describe('EXACT_SCORE', () => {
    it('home win exact: predicted(2,1) vs actual(2,1)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 2, awayScore: 1 })).toBe('EXACT_SCORE')
    })

    it('away win exact: predicted(1,3) vs actual(1,3)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 3 }, { homeScore: 1, awayScore: 3 })).toBe('EXACT_SCORE')
    })

    it('draw exact 0-0: predicted(0,0) vs actual(0,0)', () => {
      expect(calculateTier({ predictedHome: 0, predictedAway: 0 }, { homeScore: 0, awayScore: 0 })).toBe('EXACT_SCORE')
    })

    it('draw exact 2-2: predicted(2,2) vs actual(2,2)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 2 }, { homeScore: 2, awayScore: 2 })).toBe('EXACT_SCORE')
    })
  })

  // ── Tier 2: WINNER_AND_GOAL_DIFF (15pts) ───────────────────────────────
  describe('WINNER_AND_GOAL_DIFF', () => {
    it('home win diff=2: predicted(3,1) vs actual(2,0)', () => {
      expect(calculateTier({ predictedHome: 3, predictedAway: 1 }, { homeScore: 2, awayScore: 0 })).toBe('WINNER_AND_GOAL_DIFF')
    })

    it('home win diff=1: predicted(2,1) vs actual(3,2)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 3, awayScore: 2 })).toBe('WINNER_AND_GOAL_DIFF')
    })

    it('away win diff=1: predicted(1,2) vs actual(0,1)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 2 }, { homeScore: 0, awayScore: 1 })).toBe('WINNER_AND_GOAL_DIFF')
    })

    it('home win diff=1 remains 15pts even when the losing side prediction is zero: predicted(1,0) vs actual(2,1)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 0 }, { homeScore: 2, awayScore: 1 })).toBe('WINNER_AND_GOAL_DIFF')
    })

    it('away win diff=1 remains 15pts even when the home side prediction is zero: predicted(0,1) vs actual(1,2)', () => {
      expect(calculateTier({ predictedHome: 0, predictedAway: 1 }, { homeScore: 1, awayScore: 2 })).toBe('WINNER_AND_GOAL_DIFF')
    })

    it('draw is NEVER WINNER_AND_GOAL_DIFF: predicted(1,1) vs actual(0,0) → WINNER_OR_DRAW', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 1 }, { homeScore: 0, awayScore: 0 })).toBe('WINNER_OR_DRAW')
    })

    it('draw is NEVER WINNER_AND_GOAL_DIFF: predicted(2,2) vs actual(0,0) → WINNER_OR_DRAW', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 2 }, { homeScore: 0, awayScore: 0 })).toBe('WINNER_OR_DRAW')
    })
  })

  // ── Tier 3: WINNER_OR_DRAW (10pts) ─────────────────────────────────────
  describe('WINNER_OR_DRAW', () => {
    it('correct winner wrong diff: predicted(2,1) vs actual(3,1)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 3, awayScore: 1 })).toBe('WINNER_OR_DRAW')
    })

    it('correct draw any scores: predicted(1,1) vs actual(2,2)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 1 }, { homeScore: 2, awayScore: 2 })).toBe('WINNER_OR_DRAW')
    })

    it('correct draw any scores: predicted(2,2) vs actual(0,0)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 2 }, { homeScore: 0, awayScore: 0 })).toBe('WINNER_OR_DRAW')
    })

    it('correct away win wrong diff: predicted(0,2) vs actual(1,3)', () => {
      expect(calculateTier({ predictedHome: 0, predictedAway: 2 }, { homeScore: 1, awayScore: 3 })).toBe('WINNER_OR_DRAW')
    })

    it('quickstart Scenario 3: predicted(2,1) vs actual(3,1)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 3, awayScore: 1 })).toBe('WINNER_OR_DRAW')
    })

    it('quickstart Scenario 4: correct draw predicted(1,1) vs actual(0,0)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 1 }, { homeScore: 0, awayScore: 0 })).toBe('WINNER_OR_DRAW')
    })

    it('quickstart Scenario 7 tier priority: predicted(1,2) vs actual(0,2) → WINNER_OR_DRAW not ONE_TEAM_GOALS', () => {
      // Away wins both times, away goals also correct — highest tier wins
      expect(calculateTier({ predictedHome: 1, predictedAway: 2 }, { homeScore: 0, awayScore: 2 })).toBe('WINNER_OR_DRAW')
    })
  })

  // ── Tier 4: ONE_TEAM_GOALS (5pts) ──────────────────────────────────────
  describe('ONE_TEAM_GOALS', () => {
    it('home goals correct wrong result: predicted(2,1) vs actual(2,3)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 2, awayScore: 3 })).toBe('ONE_TEAM_GOALS')
    })

    it('away goals correct wrong winner: predicted(0,2) vs actual(3,2)', () => {
      expect(calculateTier({ predictedHome: 0, predictedAway: 2 }, { homeScore: 3, awayScore: 2 })).toBe('ONE_TEAM_GOALS')
    })

    it('one team correct wrong draw: predicted(2,1) vs actual(2,2)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 2, awayScore: 2 })).toBe('ONE_TEAM_GOALS')
    })

    it('quickstart Scenario 5: predicted(2,1) vs actual(2,3) → ONE_TEAM_GOALS', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 2, awayScore: 3 })).toBe('ONE_TEAM_GOALS')
    })
  })

  // ── Tier 5: TOTAL_MISS (0pts) ──────────────────────────────────────────
  describe('TOTAL_MISS', () => {
    it('both teams wrong wrong result: predicted(1,0) vs actual(3,2)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 0 }, { homeScore: 3, awayScore: 2 })).toBe('TOTAL_MISS')
    })

    it('both teams wrong wrong draw: predicted(0,0) vs actual(1,2)', () => {
      expect(calculateTier({ predictedHome: 0, predictedAway: 0 }, { homeScore: 1, awayScore: 2 })).toBe('TOTAL_MISS')
    })

    it('predicted draw but actual winner: predicted(1,1) vs actual(3,1)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 1 }, { homeScore: 3, awayScore: 1 })).toBe('TOTAL_MISS')
    })

    it('predicted winner but actual draw: predicted(2,1) vs actual(1,1)', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 1, awayScore: 1 })).toBe('TOTAL_MISS')
    })

    it('quickstart Scenario 6: predicted(1,0) vs actual(3,2)', () => {
      expect(calculateTier({ predictedHome: 1, predictedAway: 0 }, { homeScore: 3, awayScore: 2 })).toBe('TOTAL_MISS')
    })
  })

  // ── Quickstart Scenarios ────────────────────────────────────────────────
  describe('quickstart.md scenarios', () => {
    it('Scenario 1: Placar Exato — predicted(2,1) vs actual(2,1) → 25pts', () => {
      expect(calculateTier({ predictedHome: 2, predictedAway: 1 }, { homeScore: 2, awayScore: 1 })).toBe('EXACT_SCORE')
    })

    it('Scenario 2: Vencedor+Saldo — predicted(3,1) vs actual(2,0) → 15pts', () => {
      expect(calculateTier({ predictedHome: 3, predictedAway: 1 }, { homeScore: 2, awayScore: 0 })).toBe('WINNER_AND_GOAL_DIFF')
    })
  })
})
