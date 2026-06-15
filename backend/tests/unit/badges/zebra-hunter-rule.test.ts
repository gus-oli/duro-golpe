import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BadgeEvaluationContext } from '../../../src/badges/types.js'

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['JWT_SECRET'] = 'x'.repeat(32)
  process.env['WEBHOOK_SECRET'] = 'x'.repeat(16)
  process.env['BASE_URL'] = 'http://localhost:3001'
  process.env['FRONTEND_URL'] = 'http://localhost:3000'
  process.env['NODE_ENV'] = 'test'
})

const dbState = vi.hoisted(() => ({
  existingAward: false,
  increments: 0,
}))

vi.mock('../../../src/db/index.js', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(() => ({
          returning: vi.fn(async () => {
            if (dbState.existingAward) return []
            dbState.existingAward = true
            return [{ id: 'badge-1' }]
          }),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => {
          dbState.increments += 1
          return undefined
        }),
      })),
    })),
  },
}))

function context(overrides: Partial<BadgeEvaluationContext> = {}): BadgeEvaluationContext {
  return {
    userId: 'user-1',
    matchId: 'match-1',
    tier: 'WINNER_OR_DRAW',
    isZebraMatch: true,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    exactScoreCount: 0,
    winnerGoalDiffCount: 0,
    matchPoints: 10,
    positiveMatchScoreCount: 1,
    previousConsecutiveIncorrect: 0,
    ...overrides,
  }
}

describe('Zebra Hunter badge rule', () => {
  beforeEach(() => {
    dbState.existingAward = false
    dbState.increments = 0
  })

  it('awards first qualifying social zebra and increments subsequent ones', async () => {
    const { ZEBRA_HUNTER_RULE } = await import('../../../src/badges/rules/zebra-hunter.js')

    await expect(ZEBRA_HUNTER_RULE.evaluate(context())).resolves.toBe('awarded')
    await expect(ZEBRA_HUNTER_RULE.evaluate(context())).resolves.toBe('incremented')

    expect(dbState.increments).toBe(1)
  })

  it('rejects popular or partial-hit outcomes', async () => {
    const { ZEBRA_HUNTER_RULE } = await import('../../../src/badges/rules/zebra-hunter.js')

    await expect(ZEBRA_HUNTER_RULE.evaluate(context({ isZebraMatch: false }))).resolves.toBeNull()
    await expect(ZEBRA_HUNTER_RULE.evaluate(context({ tier: 'ONE_TEAM_GOALS' }))).resolves.toBeNull()

    expect(dbState.existingAward).toBe(false)
    expect(dbState.increments).toBe(0)
  })

  it('uses frozen social odds underdog signals to distinguish low-share and popular correct outcomes', async () => {
    const { buildSocialOddsView, isOutcomeSocialUnderdog } = await import('../../../src/matches/social-odds.js')
    const { ZEBRA_HUNTER_RULE } = await import('../../../src/badges/rules/zebra-hunter.js')
    const frozenOdds = buildSocialOddsView({
      counts: { homeWinCount: 3, drawCount: 1, awayWinCount: 1, totalPredictions: 5 },
      source: 'FROZEN',
      capturedAt: new Date('2026-06-15T12:00:00.000Z'),
    })

    await expect(
      ZEBRA_HUNTER_RULE.evaluate(context({ isZebraMatch: isOutcomeSocialUnderdog(frozenOdds, 'AWAY_WIN') })),
    ).resolves.toBe('awarded')
    await expect(
      ZEBRA_HUNTER_RULE.evaluate(context({ isZebraMatch: isOutcomeSocialUnderdog(frozenOdds, 'HOME_WIN') })),
    ).resolves.toBeNull()
  })
})
