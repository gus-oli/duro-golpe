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

const predictionServiceMocks = vi.hoisted(() => ({
  getLeagueUserMatchPredictions: vi.fn(),
}))

const outrightServiceMocks = vi.hoisted(() => ({
  getLeagueUserOutrightSelections: vi.fn(),
}))

vi.mock('../../src/leagues/service.js', () => leagueServiceMocks)
vi.mock('../../src/predictions/service.js', () => predictionServiceMocks)
vi.mock('../../src/outrights/service.js', () => outrightServiceMocks)

describe('League friend picks endpoints (integration)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(leagueRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  it('returns aggregated friend picks for a league member profile view', async () => {
    predictionServiceMocks.getLeagueUserMatchPredictions.mockResolvedValue([
      {
        matchId: 'match-1',
        kickoffTime: '2026-06-12T18:00:00.000Z',
        stage: 'Grupo A',
        status: 'SCHEDULED',
        homeTeam: { id: 'team-1', name: 'Brasil', fifaCode: 'BRA', flagUrl: 'https://flags/bra.png' },
        awayTeam: { id: 'team-2', name: 'Japao', fifaCode: 'JPN', flagUrl: 'https://flags/jpn.png' },
        prediction: { predictedHome: 2, predictedAway: 0 },
        submittedAt: '2026-05-20T12:00:00.000Z',
      },
    ])
    outrightServiceMocks.getLeagueUserOutrightSelections.mockResolvedValue([
      {
        marketId: 'market-1',
        marketName: 'Campeao',
        marketCode: 'CHAMPION',
        optionType: 'TEAM',
        submittedAt: '2026-05-20T13:00:00.000Z',
        selections: [{ optionId: 'option-1', label: 'Brasil', teamFlagUrl: 'https://flags/bra.png' }],
      },
    ])

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/leagues/league-1/users/user-2/picks',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(predictionServiceMocks.getLeagueUserMatchPredictions).toHaveBeenCalledWith('user-1', 'league-1', 'user-2')
    expect(outrightServiceMocks.getLeagueUserOutrightSelections).toHaveBeenCalledWith('user-1', 'league-1', 'user-2')
    expect(response.json()).toMatchObject({
      leagueId: 'league-1',
      userId: 'user-2',
      matchPredictions: [expect.objectContaining({ matchId: 'match-1' })],
      outrightSelections: [expect.objectContaining({ marketId: 'market-1' })],
    })
  })

  it('propagates access denial when the viewer is outside the league', async () => {
    predictionServiceMocks.getLeagueUserMatchPredictions.mockRejectedValue(
      Object.assign(new Error('Acesso negado'), { statusCode: 403 }),
    )
    outrightServiceMocks.getLeagueUserOutrightSelections.mockResolvedValue([])

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/leagues/league-1/users/user-2/picks',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: 'Acesso negado' })
  })

  it('returns stable empty arrays when the target member has not submitted picks yet', async () => {
    predictionServiceMocks.getLeagueUserMatchPredictions.mockResolvedValue([])
    outrightServiceMocks.getLeagueUserOutrightSelections.mockResolvedValue([])

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/leagues/league-1/users/user-2/picks',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      leagueId: 'league-1',
      userId: 'user-2',
      matchPredictions: [],
      outrightSelections: [],
    })
  })
})
