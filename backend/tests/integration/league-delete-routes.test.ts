import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { leagueRoutes } from '../../src/leagues/routes.js'

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['JWT_SECRET'] = 'x'.repeat(32)
  process.env['WEBHOOK_SECRET'] = 'x'.repeat(16)
  process.env['BASE_URL'] = 'http://localhost:3001'
  process.env['FRONTEND_URL'] = 'http://localhost:3000'
  process.env['NODE_ENV'] = 'test'
})

const leagueServiceMocks = vi.hoisted(() => ({
  createLeague: vi.fn(),
  joinLeague: vi.fn(),
  getMyLeagues: vi.fn(),
  getLeagueRanking: vi.fn(),
  deleteLeague: vi.fn(),
}))

vi.mock('../../src/leagues/service.js', () => leagueServiceMocks)
vi.mock('../../src/predictions/service.js', () => ({
  getLeagueUserMatchPredictions: vi.fn(),
}))
vi.mock('../../src/outrights/service.js', () => ({
  getLeagueUserOutrightSelections: vi.fn(),
}))

describe('League deletion routes (integration)', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(leagueRoutes)
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  function tokenFor(userId: string): string {
    return app.jwt.sign({ sub: userId })
  }

  it('allows the creator to delete a league', async () => {
    leagueServiceMocks.deleteLeague.mockResolvedValue(undefined)

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/leagues/league-1',
      headers: { authorization: `Bearer ${tokenFor('creator-1')}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ deleted: true, leagueId: 'league-1' })
    expect(leagueServiceMocks.deleteLeague).toHaveBeenCalledWith('creator-1', 'league-1')
  })

  it('rejects a non-creator league member', async () => {
    leagueServiceMocks.deleteLeague.mockRejectedValue(Object.assign(new Error('Acesso negado'), { statusCode: 403 }))

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/leagues/league-1',
      headers: { authorization: `Bearer ${tokenFor('member-1')}` },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: 'Acesso negado' })
  })

  it('rejects an authenticated non-member', async () => {
    leagueServiceMocks.deleteLeague.mockRejectedValue(Object.assign(new Error('Acesso negado'), { statusCode: 403 }))

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/leagues/league-1',
      headers: { authorization: `Bearer ${tokenFor('outsider-1')}` },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: 'Acesso negado' })
  })

  it('rejects anonymous deletion', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/leagues/league-1',
    })

    expect(response.statusCode).toBe(401)
    expect(leagueServiceMocks.deleteLeague).not.toHaveBeenCalled()
  })

  it('returns not found for a missing league', async () => {
    leagueServiceMocks.deleteLeague.mockRejectedValue(
      Object.assign(new Error('Liga nao encontrada'), { statusCode: 404 }),
    )

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/leagues/missing-league',
      headers: { authorization: `Bearer ${tokenFor('creator-1')}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: 'Liga nao encontrada' })
  })
})
