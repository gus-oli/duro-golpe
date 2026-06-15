import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  leagues: new Map<string, { id: string; name: string; inviteCode: string; createdBy: string; createdAt: Date }>(),
  memberships: new Map<string, { id: string; leagueId: string; userId: string }>(),
  muralPosts: new Map<string, { id: string; leagueId: string; content: string }>(),
  personalData: {
    users: new Set<string>(),
    predictions: new Set<string>(),
    matchScores: new Set<string>(),
    outrightSelections: new Set<string>(),
    userTotals: new Set<string>(),
    userBadges: new Set<string>(),
  },
}))

vi.mock('../../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            const league = Array.from(state.leagues.values())[0]
            return league ? [league] : []
          },
        }),
      }),
    })),
    delete: vi.fn(() => ({
      where: async () => {
        const leagueId = Array.from(state.leagues.keys())[0] ?? ''
        state.leagues.delete(leagueId)

        for (const [key, membership] of state.memberships) {
          if (membership.leagueId === leagueId) state.memberships.delete(key)
        }

        for (const [key, post] of state.muralPosts) {
          if (post.leagueId === leagueId) state.muralPosts.delete(key)
        }
      },
    })),
  },
}))

import { deleteLeague } from '../../../src/leagues/service.js'

describe('deleteLeague service', () => {
  beforeEach(() => {
    state.leagues.clear()
    state.memberships.clear()
    state.muralPosts.clear()
    state.personalData.users = new Set(['user-1'])
    state.personalData.predictions = new Set(['prediction-1'])
    state.personalData.matchScores = new Set(['score-1'])
    state.personalData.outrightSelections = new Set(['selection-1'])
    state.personalData.userTotals = new Set(['user-1'])
    state.personalData.userBadges = new Set(['badge-1'])
  })

  it('deletes a creator-owned league and league-owned data only', async () => {
    state.leagues.set('league-1', {
      id: 'league-1',
      name: 'Liga Teste',
      inviteCode: 'ABCDEFGH',
      createdBy: 'user-1',
      createdAt: new Date('2026-06-15T12:00:00.000Z'),
    })
    state.memberships.set('membership-1', { id: 'membership-1', leagueId: 'league-1', userId: 'user-1' })
    state.muralPosts.set('post-1', { id: 'post-1', leagueId: 'league-1', content: 'Teste' })

    await deleteLeague('user-1', 'league-1')

    expect(state.leagues.has('league-1')).toBe(false)
    expect(state.memberships.size).toBe(0)
    expect(state.muralPosts.size).toBe(0)
    expect(state.personalData.users.has('user-1')).toBe(true)
    expect(state.personalData.predictions.has('prediction-1')).toBe(true)
    expect(state.personalData.matchScores.has('score-1')).toBe(true)
    expect(state.personalData.outrightSelections.has('selection-1')).toBe(true)
    expect(state.personalData.userTotals.has('user-1')).toBe(true)
    expect(state.personalData.userBadges.has('badge-1')).toBe(true)
  })

  it('rejects non-creators without deleting the league', async () => {
    state.leagues.set('league-1', {
      id: 'league-1',
      name: 'Liga Teste',
      inviteCode: 'ABCDEFGH',
      createdBy: 'creator-1',
      createdAt: new Date('2026-06-15T12:00:00.000Z'),
    })

    await expect(deleteLeague('member-1', 'league-1')).rejects.toMatchObject({ statusCode: 403 })
    expect(state.leagues.has('league-1')).toBe(true)
  })

  it('returns not found for missing leagues', async () => {
    await expect(deleteLeague('user-1', 'missing-league')).rejects.toMatchObject({ statusCode: 404 })
  })
})
