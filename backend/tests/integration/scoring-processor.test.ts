import { beforeEach, describe, expect, it, vi } from 'vitest'

const subscribedHandlers = vi.hoisted(() => new Map<string, (message: string) => Promise<void>>())
const createClientMock = vi.hoisted(() => vi.fn())
const publisherMock = vi.hoisted(() => ({
  connect: vi.fn().mockResolvedValue(undefined),
  publish: vi.fn().mockResolvedValue(1),
}))
const subscriberMock = vi.hoisted(() => ({
  connect: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn(async (channel: string, handler: (message: string) => Promise<void>) => {
    subscribedHandlers.set(channel, handler)
  }),
}))

const dbMocks = vi.hoisted(() => ({
  predictions: [] as Array<{
    id: string
    userId: string
    predictedHome: number
    predictedAway: number
  }>,
  insertResult: [] as Array<{ id: string }>,
}))

vi.mock('redis', () => ({
  createClient: createClientMock,
}))

vi.mock('../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(dbMocks.predictions),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue(dbMocks.insertResult),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}))

describe('Scoring pipeline (integration)', () => {
  beforeEach(() => {
    vi.resetModules()
    subscribedHandlers.clear()
    createClientMock.mockReset()
    let clientCalls = 0
    createClientMock.mockImplementation(() => {
      clientCalls += 1
      return clientCalls === 1 ? subscriberMock : publisherMock
    })
    publisherMock.publish.mockClear()
    subscriberMock.subscribe.mockClear()
    dbMocks.predictions = []
    dbMocks.insertResult = []
  })

  describe('match.result.confirmed event processing', () => {
    it('publishes scores.updated when new match scores are inserted', async () => {
      const { startScoringProcessor } = await import('../../src/scoring/processor.js')

      dbMocks.predictions = [
        {
          id: 'pred-1',
          userId: 'user-1',
          predictedHome: 2,
          predictedAway: 1,
        },
      ]
      dbMocks.insertResult = [{ id: 'score-1' }]

      await startScoringProcessor()

      const handler = subscribedHandlers.get('match.result.confirmed')
      expect(handler).toBeTypeOf('function')

      await handler?.(
        JSON.stringify({
          event: 'match.result.confirmed',
          matchResultId: 'result-1',
          matchId: 'match-1',
          homeGoals: 2,
          awayGoals: 1,
          confirmedAt: new Date().toISOString(),
        }),
      )

      expect(publisherMock.publish).toHaveBeenCalledWith(
        'scores.updated',
        expect.stringContaining('"affectedUserIds":["user-1"]'),
      )
    })

    it('does not publish scores.updated when the score insert is idempotently ignored', async () => {
      const { startScoringProcessor } = await import('../../src/scoring/processor.js')

      dbMocks.predictions = [
        {
          id: 'pred-1',
          userId: 'user-1',
          predictedHome: 2,
          predictedAway: 1,
        },
      ]
      dbMocks.insertResult = []

      await startScoringProcessor()

      const handler = subscribedHandlers.get('match.result.confirmed')
      await handler?.(
        JSON.stringify({
          event: 'match.result.confirmed',
          matchResultId: 'result-1',
          matchId: 'match-1',
          homeGoals: 2,
          awayGoals: 1,
          confirmedAt: new Date().toISOString(),
        }),
      )

      expect(publisherMock.publish).not.toHaveBeenCalledWith(
        'scores.updated',
        expect.any(String),
      )
    })
  })
})
