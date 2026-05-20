import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  matches: new Map<string, { id: string; status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED' }>(),
  predictions: new Map<string, { id: string; userId: string; matchId: string; predictedHome: number; predictedAway: number; submittedAt?: Date }>(),
}))

vi.mock('../../../src/matches/service.js', () => ({
  getMatchById: vi.fn(async (matchId: string) => state.matches.get(matchId)),
}))

vi.mock('../../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: () => ({
        where: ({ right }: { right?: { value?: string } }) => ({
          limit: async () => {
            const matchId = right?.value
            const prediction = Array.from(state.predictions.values()).find((item) => item.matchId === matchId)
            return prediction ? [prediction] : []
          },
        }),
      }),
    })),
    insert: vi.fn(() => ({
      values: ({ userId, matchId, predictedHome, predictedAway }: { userId: string; matchId: string; predictedHome: number; predictedAway: number }) => ({
        returning: async () => {
          const prediction = {
            id: `pred-${matchId}`,
            userId,
            matchId,
            predictedHome,
            predictedAway,
            submittedAt: new Date(),
          }
          state.predictions.set(`${userId}:${matchId}`, prediction)
          return [prediction]
        },
      }),
    })),
    update: vi.fn(() => ({
      set:
        ({ predictedHome, predictedAway }: { predictedHome: number; predictedAway: number }) =>
        ({
          where: ({ right }: { right?: { value?: string } }) => ({
            returning: async () => {
              const matchId = right?.value
              const existing = matchId ? Array.from(state.predictions.values()).find((item) => item.matchId === matchId) : undefined
              if (!existing) {
                return []
              }

              const updated = {
                ...existing,
                predictedHome,
                predictedAway,
                submittedAt: new Date(),
              }
              state.predictions.set(`${updated.userId}:${updated.matchId}`, updated)
              return [updated]
            },
          }),
        }),
    })),
  },
}))

import { savePredictionsBatch } from '../../../src/predictions/service.js'

describe('savePredictionsBatch', () => {
  beforeEach(() => {
    state.matches.clear()
    state.predictions.clear()
  })

  it('creates and updates predictions in the same batch', async () => {
    state.matches.set('match-open-1', { id: 'match-open-1', status: 'SCHEDULED' })
    state.matches.set('match-open-2', { id: 'match-open-2', status: 'SCHEDULED' })
    state.predictions.set('user-1:match-open-2', {
      id: 'pred-existing',
      userId: 'user-1',
      matchId: 'match-open-2',
      predictedHome: 1,
      predictedAway: 1,
    })

    const result = await savePredictionsBatch('user-1', [
      { matchId: 'match-open-1', predictedHome: 2, predictedAway: 0 },
      { matchId: 'match-open-2', predictedHome: 3, predictedAway: 1 },
    ])

    expect(result.failed).toEqual([])
    expect(result.saved).toHaveLength(2)
    expect(result.saved).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ matchId: 'match-open-1', predictedHome: 2, predictedAway: 0 }),
        expect.objectContaining({ matchId: 'match-open-2', predictedHome: 3, predictedAway: 1 }),
      ]),
    )
  })

  it('returns partial failures when one match is locked', async () => {
    state.matches.set('match-open', { id: 'match-open', status: 'SCHEDULED' })
    state.matches.set('match-locked', { id: 'match-locked', status: 'LOCKED' })

    const result = await savePredictionsBatch('user-1', [
      { matchId: 'match-open', predictedHome: 1, predictedAway: 0 },
      { matchId: 'match-locked', predictedHome: 2, predictedAway: 2 },
    ])

    expect(result.saved).toHaveLength(1)
    expect(result.saved[0]).toMatchObject({ matchId: 'match-open' })
    expect(result.failed).toEqual([
      expect.objectContaining({
        matchId: 'match-locked',
        statusCode: 403,
        message: 'Palpites encerrados para esta partida',
      }),
    ])
  })
})
