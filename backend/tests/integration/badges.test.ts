import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BadgeEvaluationContext, BadgeType } from '../../src/badges/types.js'

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['JWT_SECRET'] = 'x'.repeat(32)
  process.env['WEBHOOK_SECRET'] = 'x'.repeat(16)
  process.env['BASE_URL'] = 'http://localhost:3001'
  process.env['FRONTEND_URL'] = 'http://localhost:3000'
  process.env['NODE_ENV'] = 'test'
})

const state = vi.hoisted(() => ({
  awarded: new Map<string, { userId: string; badgeType: BadgeType; awardedAt: Date }>(),
  selectCall: 0,
}))

const sendToUserMock = vi.hoisted(() => vi.fn())

vi.mock('../../src/realtime/user-sessions.js', () => ({
  sendToUser: sendToUserMock,
}))

vi.mock('../../src/db/index.js', () => ({
  db: {
    insert: vi.fn(() => ({
      values: ({ userId, badgeType }: { userId: string; badgeType: BadgeType }) => ({
        onConflictDoNothing: () => ({
          returning: async () => {
            const key = `${userId}:${badgeType}`
            if (state.awarded.has(key)) return []

            state.awarded.set(key, { userId, badgeType, awardedAt: new Date('2026-06-15T12:00:00.000Z') })
            return [{ id: key }]
          },
        }),
      }),
    })),
    select: vi.fn(() => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            state.selectCall += 1
            if (state.selectCall % 2 === 1) {
              return [
                {
                  type: 'PRIMEIRA_CRAVADA',
                  labelPt: 'Primeira Cravada',
                  descriptionPt: 'Acertou seu primeiro placar exato',
                  iconKey: 'badge-primeira-cravada',
                },
              ]
            }

            const row = state.awarded.get('user-1:PRIMEIRA_CRAVADA')
            return row ? [row] : []
          },
        }),
      }),
    })),
  },
}))

function makeContext(overrides: Partial<BadgeEvaluationContext> = {}): BadgeEvaluationContext {
  return {
    userId: 'user-1',
    matchId: 'match-1',
    tier: 'TOTAL_MISS',
    isZebraMatch: false,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    exactScoreCount: 1,
    winnerGoalDiffCount: 0,
    matchPoints: 0,
    positiveMatchScoreCount: 0,
    previousConsecutiveIncorrect: 0,
    ...overrides,
  }
}

describe('Badge award pipeline (integration)', () => {
  beforeEach(() => {
    state.awarded.clear()
    state.selectCall = 0
    sendToUserMock.mockClear()
  })

  it('awards an expanded scoring badge and emits badge:awarded once', async () => {
    const { runEvaluation } = await import('../../src/badges/evaluator.js')

    await runEvaluation(makeContext())
    await runEvaluation(makeContext())

    expect(state.awarded.get('user-1:PRIMEIRA_CRAVADA')).toMatchObject({
      userId: 'user-1',
      badgeType: 'PRIMEIRA_CRAVADA',
    })
    expect(sendToUserMock).toHaveBeenCalledTimes(1)
    expect(sendToUserMock).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        type: 'badge:awarded',
        badge: expect.objectContaining({
          type: 'PRIMEIRA_CRAVADA',
          iconKey: 'badge-primeira-cravada',
        }),
      }),
    )
  })
})
