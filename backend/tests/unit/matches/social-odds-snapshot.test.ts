import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['JWT_SECRET'] = 'x'.repeat(32)
  process.env['WEBHOOK_SECRET'] = 'x'.repeat(16)
  process.env['BASE_URL'] = 'http://localhost:3001'
  process.env['FRONTEND_URL'] = 'http://localhost:3000'
  process.env['NODE_ENV'] = 'test'
})

const dbMocks = vi.hoisted(() => ({
  onConflictDoUpdate: vi.fn(),
  predictions: [
    { predictedHome: 2, predictedAway: 1 },
    { predictedHome: 1, predictedAway: 1 },
    { predictedHome: 0, predictedAway: 2 },
  ],
}))

vi.mock('../../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => dbMocks.predictions),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((values) => ({
        onConflictDoUpdate: dbMocks.onConflictDoUpdate.mockImplementation(() => ({
          returning: vi.fn(async () => [{ ...values, id: 'snapshot-1' }]),
        })),
      })),
    })),
  },
}))

describe('social odds snapshot persistence', () => {
  beforeEach(() => {
    vi.resetModules()
    dbMocks.onConflictDoUpdate.mockClear()
  })

  it('uses idempotent upsert semantics when creating a frozen snapshot repeatedly', async () => {
    const { createOrUpdateSocialOddsSnapshot } = await import('../../../src/matches/social-odds.js')

    await createOrUpdateSocialOddsSnapshot('match-1', new Date('2026-06-15T12:00:00.000Z'))
    await createOrUpdateSocialOddsSnapshot('match-1', new Date('2026-06-15T12:00:00.000Z'))

    expect(dbMocks.onConflictDoUpdate).toHaveBeenCalledTimes(2)
  })
})
