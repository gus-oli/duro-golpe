import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  marketRows: [] as Array<{ id: string; code: string; optionType: 'TEAM' | 'PLAYER' }>,
  teamRows: [] as Array<{ id: string; name: string; fifaCode: string; apiFootballId: string | null }>,
  inserts: [] as Array<{ table: unknown; values: Record<string, unknown> }>,
  insertUpdates: [] as Array<Record<string, unknown>>,
  updates: [] as Array<{ table: unknown; values: Record<string, unknown> }>,
  deletes: [] as Array<unknown>,
}))

const schemaTokens = vi.hoisted(() => {
  const outrightMarkets = { id: 'market.id', code: 'market.code' }
  const outrightOptions = {
    marketId: 'option.marketId',
    label: 'option.label',
    teamId: 'option.teamId',
  }
  const teams = { id: 'team.id', name: 'team.name' }

  return {
    outrightMarkets,
    outrightOptions,
    teams,
  }
})

vi.mock('../../../src/db/schema/index.js', () => {
  return schemaTokens
})

vi.mock('../../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: (table: unknown) => {
        if (table === schemaTokens.outrightMarkets) {
          return Promise.resolve(state.marketRows)
        }

        if (table === schemaTokens.teams) {
          return {
            orderBy: async () => state.teamRows,
          }
        }

        throw new Error('Unexpected table in select mock')
      },
    })),
    insert: vi.fn((table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        state.inserts.push({ table, values })

        return {
          onConflictDoUpdate: async ({ set }: { set: Record<string, unknown> }) => {
            state.insertUpdates.push(set)
          },
        }
      },
    })),
    update: vi.fn((table: unknown) => ({
      set: (values: Record<string, unknown>) => {
        state.updates.push({ table, values })
        return {
          where: async () => undefined,
        }
      },
    })),
    delete: vi.fn((table: unknown) => ({
      where: async () => {
        state.deletes.push(table)
      },
    })),
  },
}))

const { seedOutrightOptions } = await import('../../../src/outrights/seed.js')

describe('player outright option refresh', () => {
  beforeEach(() => {
    state.marketRows = [
      { id: 'market-team', code: 'CHAMPION', optionType: 'TEAM' },
      { id: 'market-player', code: 'TOP_SCORER', optionType: 'PLAYER' },
    ]
    state.teamRows = [
      { id: 'team-bra', name: 'Brasil', fifaCode: 'BRA', apiFootballId: '764' },
      { id: 'team-fra', name: 'Franca', fifaCode: 'FRA', apiFootballId: '773' },
    ]
    state.inserts = []
    state.insertUpdates = []
    state.updates = []
    state.deletes = []
  })

  it('upserts player metadata and deactivates stale player options instead of deleting them', async () => {
    await seedOutrightOptions()

    const playerInsert = state.inserts.find(
      (entry) =>
        entry.table === schemaTokens.outrightOptions &&
        entry.values.marketId === 'market-player' &&
        typeof entry.values.sourceTier === 'string',
    )

    expect(playerInsert?.values).toMatchObject({
      marketId: 'market-player',
      teamId: null,
      isActive: true,
      teamLabel: expect.any(String),
      sourceTier: expect.stringMatching(/OFFICIAL|PRELIMINARY|LIKELY/),
      sortOrder: expect.any(Number),
    })

    expect(
      state.updates.some(
        (entry) =>
          entry.table === schemaTokens.outrightOptions &&
          entry.values.isActive === false &&
          entry.values.isFeatured === false,
      ),
    ).toBe(true)
  })

  it('keeps destructive cleanup only for team markets', async () => {
    await seedOutrightOptions()

    expect(state.deletes).toContain(schemaTokens.outrightOptions)
    expect(state.updates.some((entry) => entry.table === schemaTokens.outrightOptions)).toBe(true)
  })
})
