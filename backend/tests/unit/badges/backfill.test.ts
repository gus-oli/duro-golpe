import { describe, expect, it, vi } from 'vitest'
import { buildBadgeBackfillContexts, type BadgeBackfillScoreRow } from '../../../src/badges/backfill.js'

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['JWT_SECRET'] = 'x'.repeat(32)
  process.env['WEBHOOK_SECRET'] = 'x'.repeat(16)
  process.env['BASE_URL'] = 'http://localhost:3001'
  process.env['FRONTEND_URL'] = 'http://localhost:3000'
  process.env['NODE_ENV'] = 'test'
})

describe('badge backfill context builder', () => {
  it('reconstructs scoring aggregates and previous cold streak chronologically', () => {
    const rows: BadgeBackfillScoreRow[] = [
      { userId: 'user-1', matchId: 'match-1', tier: 'TOTAL_MISS', points: 0 },
      { userId: 'user-1', matchId: 'match-2', tier: 'TOTAL_MISS', points: 0 },
      { userId: 'user-1', matchId: 'match-3', tier: 'TOTAL_MISS', points: 0 },
      { userId: 'user-1', matchId: 'match-4', tier: 'EXACT_SCORE', points: 25 },
      { userId: 'user-1', matchId: 'match-5', tier: 'WINNER_AND_GOAL_DIFF', points: 15 },
    ]

    const contexts = buildBadgeBackfillContexts(rows)

    expect(contexts[3]).toMatchObject({
      userId: 'user-1',
      matchId: 'match-4',
      tier: 'EXACT_SCORE',
      previousConsecutiveIncorrect: 3,
      consecutiveCorrect: 1,
      consecutiveIncorrect: 0,
      exactScoreCount: 1,
      matchPoints: 25,
      positiveMatchScoreCount: 1,
    })
    expect(contexts[4]).toMatchObject({
      matchId: 'match-5',
      winnerGoalDiffCount: 1,
      matchPoints: 40,
      positiveMatchScoreCount: 2,
      consecutiveCorrect: 2,
    })
  })

  it('keeps user streak state independent when rows are interleaved', () => {
    const rows: BadgeBackfillScoreRow[] = [
      { userId: 'user-1', matchId: 'match-1', tier: 'TOTAL_MISS', points: 0 },
      { userId: 'user-2', matchId: 'match-1', tier: 'EXACT_SCORE', points: 25 },
      { userId: 'user-1', matchId: 'match-2', tier: 'WINNER_OR_DRAW', points: 10 },
    ]

    const contexts = buildBadgeBackfillContexts(rows)

    expect(contexts[1]).toMatchObject({
      userId: 'user-2',
      consecutiveCorrect: 1,
      exactScoreCount: 1,
      previousConsecutiveIncorrect: 0,
    })
    expect(contexts[2]).toMatchObject({
      userId: 'user-1',
      previousConsecutiveIncorrect: 1,
      consecutiveCorrect: 1,
      exactScoreCount: 0,
    })
  })
})
