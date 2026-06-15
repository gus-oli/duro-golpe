import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { matchRoutes } from '../../../src/matches/routes.js'

const matchServiceMocks = vi.hoisted(() => ({
  getMatches: vi.fn(),
  getMatchById: vi.fn(),
}))

vi.mock('../../../src/matches/service.js', () => matchServiceMocks)

const socialOdds = {
  status: 'AVAILABLE',
  source: 'FROZEN',
  totalPredictions: 10,
  minimumSample: 1,
  underdogThresholdBps: 3000,
  underdogThresholdPercentage: 30,
  capturedAt: '2026-06-15T12:00:00.000Z',
  outcomes: [
    { outcome: 'HOME_WIN', count: 7, basisPoints: 7000, percentage: 70 },
    { outcome: 'DRAW', count: 1, basisPoints: 1000, percentage: 10 },
    { outcome: 'AWAY_WIN', count: 2, basisPoints: 2000, percentage: 20 },
  ],
}

describe('Match routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(matchRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  it('returns social odds on match list responses', async () => {
    matchServiceMocks.getMatches.mockResolvedValue([
      {
        id: 'match-1',
        kickoffTime: '2026-06-15T12:00:00.000Z',
        stage: 'Grupo A',
        venue: null,
        status: 'LOCKED',
        homeScore: null,
        awayScore: null,
        homeTeam: { id: 'team-1', name: 'Brasil', fifaCode: 'BRA', flagUrl: null },
        awayTeam: { id: 'team-2', name: 'Japao', fifaCode: 'JPN', flagUrl: null },
        userPrediction: null,
        socialOdds,
      },
    ])

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/matches',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(matchServiceMocks.getMatches).toHaveBeenCalledWith(undefined, 'user-1')
    expect(response.json().matches[0].socialOdds).toMatchObject({
      status: 'AVAILABLE',
      totalPredictions: 10,
    })
  })

  it('passes optional auth to match detail so prediction-safe social odds can be returned', async () => {
    matchServiceMocks.getMatchById.mockResolvedValue({
      id: 'match-1',
      kickoffTime: '2026-06-15T12:00:00.000Z',
      stage: 'Grupo A',
      venue: null,
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
      homeTeam: { id: 'team-1', name: 'Brasil', fifaCode: 'BRA', flagUrl: null },
      awayTeam: { id: 'team-2', name: 'Japao', fifaCode: 'JPN', flagUrl: null },
      userPrediction: { predictedHome: 1, predictedAway: 2 },
      socialOdds: { ...socialOdds, source: 'CURRENT', capturedAt: null },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/matches/match-1',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(matchServiceMocks.getMatchById).toHaveBeenCalledWith('match-1', 'user-1')
    expect(response.json().socialOdds).toMatchObject({
      status: 'AVAILABLE',
      source: 'CURRENT',
    })
  })
})
