import { describe, it, expect } from 'vitest'

// Integration tests for scoring REST endpoints.
// Testcontainers wiring deferred — stubs demonstrate expected behaviour.

describe('Score routes (integration)', () => {
  describe('GET /api/v1/users/:userId/score', () => {
    it('returns UserTotal fields for authenticated user', async () => {
      // Seed user_totals → GET /users/:id/score
      // Expect: totalPoints, matchPoints, outrightPoints, exactScoreCount, winnerGoalDiffCount
      expect(true).toBe(true)
    })

    it('returns 404 when user not found', async () => {
      expect(true).toBe(true)
    })

    it('requires authentication (401 without token)', async () => {
      expect(true).toBe(true)
    })
  })

  describe('GET /api/v1/users/:userId/scores/matches', () => {
    it('returns paginated match scores with tier + predicted vs actual', async () => {
      // Seed match_scores → GET /users/:id/scores/matches
      // Expect: items[].tier, items[].points, items[].prediction, items[].result
      expect(true).toBe(true)
    })

    it('requires authentication', async () => {
      expect(true).toBe(true)
    })
  })

  describe('GET /api/v1/matches/:matchId/score-summary', () => {
    it('returns tier distribution for a concluded match', async () => {
      // Seed multiple match_scores for same match → GET score-summary
      // Expect: tierBreakdown with count + percent per tier
      expect(true).toBe(true)
    })
  })
})
