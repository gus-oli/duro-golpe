import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => {
  return {
    activeRows: [] as Array<{ id: string }>,
    providerMatches: [] as Array<{
      id: number
      status: string
      utcDate: string
      venue: string | null
      stage: string | null
      group: string | null
      lastUpdated: string
      homeTeam: { id: number | null; name: string | null; tla: string | null; crest: string | null }
      awayTeam: { id: number | null; name: string | null; tla: string | null; crest: string | null }
      score: {
        duration?: string | null
        fullTime: { home: number | null; away: number | null }
        regularTime?: { home: number | null; away: number | null } | null
        extraTime?: { home: number | null; away: number | null } | null
        penalties?: { home: number | null; away: number | null } | null
      }
    }>,
    applyResults: [] as Array<'missing' | 'noop' | 'updated' | 'confirmed' | 'amended'>,
    appliedSnapshots: [] as Array<Record<string, unknown>>,
    upsertedTeams: [] as Array<Array<Record<string, unknown>>>,
    updatedMatches: [] as Array<Record<string, unknown>>,
  }
})

vi.mock('../../../src/config.js', () => ({
  config: {
    FOOTBALL_DATA_POLL_ENABLED: true,
    FOOTBALL_DATA_TOKEN: 'test-token',
  },
}))

vi.mock('../../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: () => ({
        where: () => ({
          limit: async () => state.activeRows,
        }),
      }),
    })),
    update: vi.fn(() => ({
      set: (values: Record<string, unknown>) => {
        state.updatedMatches.push(values)
        return {
          where: async () => undefined,
        }
      },
    })),
  },
}))

vi.mock('../../../src/data-providers/football-data.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/data-providers/football-data.js')>()
  return {
    ...actual,
    getWorldCupMatches: vi.fn(async () => state.providerMatches),
  }
})

vi.mock('../../../src/seeds/support.js', () => ({
  upsertTeams: vi.fn(async (teams: Array<{ key: string }>) => {
    state.upsertedTeams.push(teams)
    return Object.fromEntries(teams.map((team, index) => [team.key, `team-${index + 1}`]))
  }),
}))

vi.mock('../../../src/data-providers/match-reconciliation.js', () => ({
  applyProviderMatchSnapshot: vi.fn(async (snapshot: Record<string, unknown>) => {
    state.appliedSnapshots.push(snapshot)
    return state.applyResults.shift() ?? 'updated'
  }),
}))

import { syncFootballDataOnce } from '../../../src/data-providers/sync-football-data.js'

describe('syncFootballDataOnce', () => {
  beforeEach(() => {
    state.activeRows = []
    state.providerMatches = []
    state.applyResults = []
    state.appliedSnapshots = []
    state.upsertedTeams = []
    state.updatedMatches = []
  })

  it('uses the idle cadence when no live or near-live local matches are present', async () => {
    state.providerMatches = [
      {
        id: 101,
        status: 'SCHEDULED',
        utcDate: '2026-06-11T16:00:00.000Z',
        venue: null,
        stage: 'GROUP_STAGE',
        group: 'GROUP_A',
        lastUpdated: '2026-06-11T16:00:00.000Z',
        homeTeam: { id: 1, name: 'Brazil', tla: 'BRA', crest: null },
        awayTeam: { id: 2, name: 'Germany', tla: 'GER', crest: null },
        score: { fullTime: { home: null, away: null } },
      },
    ]
    state.applyResults = ['updated']

    const summary = await syncFootballDataOnce(new Date('2026-06-10T12:00:00.000Z'))

    expect(summary.nextDelayMs).toBe(60000)
    expect(summary.processed).toBe(1)
    expect(summary.applied).toBe(1)
    expect(summary.skipped).toBe(0)
    expect(summary.missing).toBe(0)
  })

  it('tightens cadence and forwards mapped snapshots during active windows', async () => {
    state.activeRows = [{ id: 'live-match' }]
    state.providerMatches = [
      {
        id: 202,
        status: 'IN_PLAY',
        utcDate: '2026-06-11T18:00:00.000Z',
        venue: null,
        stage: 'GROUP_STAGE',
        group: 'GROUP_A',
        lastUpdated: '2026-06-11T18:10:00.000Z',
        homeTeam: { id: 1, name: 'Brazil', tla: 'BRA', crest: null },
        awayTeam: { id: 2, name: 'Germany', tla: 'GER', crest: null },
        score: { fullTime: { home: 1, away: 0 } },
      },
      {
        id: 203,
        status: 'FINISHED',
        utcDate: '2026-06-11T20:00:00.000Z',
        venue: null,
        stage: 'GROUP_STAGE',
        group: 'GROUP_B',
        lastUpdated: '2026-06-11T20:10:00.000Z',
        homeTeam: { id: 3, name: 'France', tla: 'FRA', crest: null },
        awayTeam: { id: 4, name: 'Argentina', tla: 'ARG', crest: null },
        score: { fullTime: { home: 2, away: 1 } },
      },
    ]
    state.applyResults = ['updated', 'confirmed']

    const summary = await syncFootballDataOnce(new Date('2026-06-11T18:15:00.000Z'))

    expect(summary.nextDelayMs).toBe(10000)
    expect(summary.processed).toBe(2)
    expect(summary.applied).toBe(2)
    expect(state.appliedSnapshots).toHaveLength(2)
    expect(state.appliedSnapshots[0]).toMatchObject({
      providerMatchId: '202',
      status: 'LIVE',
      homeScore: 1,
      awayScore: 0,
      source: 'football-data-v4-poll',
    })
    expect(state.appliedSnapshots[1]).toMatchObject({
      providerMatchId: '203',
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 1,
      source: 'football-data-v4-poll',
    })
  })

  it('excludes penalty-shootout goals from finished football-data results', async () => {
    state.providerMatches = [
      {
        id: 204,
        status: 'FINISHED',
        utcDate: '2026-06-28T20:00:00.000Z',
        venue: null,
        stage: 'LAST_32',
        group: null,
        lastUpdated: '2026-06-28T22:45:00.000Z',
        homeTeam: { id: 3, name: 'France', tla: 'FRA', crest: null },
        awayTeam: { id: 4, name: 'Argentina', tla: 'ARG', crest: null },
        score: {
          duration: 'PENALTY_SHOOTOUT',
          fullTime: { home: 7, away: 6 },
          regularTime: { home: 1, away: 1 },
          extraTime: { home: 0, away: 0 },
          penalties: { home: 6, away: 5 },
        },
      },
    ]
    state.applyResults = ['confirmed']

    const summary = await syncFootballDataOnce(new Date('2026-06-28T23:00:00.000Z'))

    expect(summary.processed).toBe(1)
    expect(summary.applied).toBe(1)
    expect(state.appliedSnapshots[0]).toMatchObject({
      providerMatchId: '204',
      status: 'FINISHED',
      homeScore: 1,
      awayScore: 1,
      source: 'football-data-v4-poll',
    })
  })

  it('counts ignored and missing provider snapshots safely', async () => {
    state.providerMatches = [
      {
        id: 301,
        status: 'POSTPONED',
        utcDate: '2026-06-12T12:00:00.000Z',
        venue: null,
        stage: 'GROUP_STAGE',
        group: 'GROUP_A',
        lastUpdated: '2026-06-12T12:00:00.000Z',
        homeTeam: { id: 1, name: 'Brazil', tla: 'BRA', crest: null },
        awayTeam: { id: 2, name: 'Germany', tla: 'GER', crest: null },
        score: { fullTime: { home: null, away: null } },
      },
      {
        id: 302,
        status: 'TIMED',
        utcDate: '2026-06-12T13:00:00.000Z',
        venue: null,
        stage: 'GROUP_STAGE',
        group: 'GROUP_A',
        lastUpdated: '2026-06-12T13:00:00.000Z',
        homeTeam: { id: 1, name: 'Brazil', tla: 'BRA', crest: null },
        awayTeam: { id: 2, name: 'Germany', tla: 'GER', crest: null },
        score: { fullTime: { home: null, away: null } },
      },
    ]
    state.applyResults = ['missing']

    const summary = await syncFootballDataOnce(new Date('2026-06-12T09:00:00.000Z'))

    expect(summary.processed).toBe(1)
    expect(summary.applied).toBe(0)
    expect(summary.skipped).toBe(1)
    expect(summary.missing).toBe(1)
  })

  it('reconciles knockout participants when provider starts filling the bracket', async () => {
    state.providerMatches = [
      {
        id: 401,
        status: 'TIMED',
        utcDate: '2026-06-28T18:00:00.000Z',
        venue: null,
        stage: 'LAST_32',
        group: null,
        lastUpdated: '2026-06-27T12:00:00.000Z',
        homeTeam: { id: 11, name: 'Brazil', tla: 'BRA', crest: null },
        awayTeam: { id: 19, name: 'Mexico', tla: 'MEX', crest: null },
        score: { fullTime: { home: null, away: null } },
      },
    ]
    state.applyResults = ['updated']

    await syncFootballDataOnce(new Date('2026-06-27T12:00:00.000Z'))

    expect(state.upsertedTeams).toHaveLength(1)
    expect(state.upsertedTeams[0]).toEqual([
      expect.objectContaining({ key: '11', fifaCode: 'BRA', name: 'Brasil' }),
      expect.objectContaining({ key: '19', fifaCode: 'MEX', name: 'M\u00e9xico' }),
    ])
    expect(state.updatedMatches).toContainEqual({
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
    })
  })

  it('localizes provider names before upserting team participants', async () => {
    state.providerMatches = [
      {
        id: 501,
        status: 'TIMED',
        utcDate: '2026-06-12T13:00:00.000Z',
        venue: null,
        stage: 'GROUP_STAGE',
        group: 'GROUP_A',
        lastUpdated: '2026-06-12T13:00:00.000Z',
        homeTeam: { id: 1, name: 'Brazil', tla: 'BRA', crest: null },
        awayTeam: { id: 2, name: 'France', tla: 'FRA', crest: null },
        score: { fullTime: { home: null, away: null } },
      },
    ]
    state.applyResults = ['updated']

    await syncFootballDataOnce(new Date('2026-06-12T09:00:00.000Z'))

    expect(state.upsertedTeams[0]).toEqual([
      expect.objectContaining({ name: 'Brasil', fifaCode: 'BRA' }),
      expect.objectContaining({ name: 'Fran\u00e7a', fifaCode: 'FRA' }),
    ])
  })
})
