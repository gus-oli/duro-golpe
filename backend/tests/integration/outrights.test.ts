import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { outrightRoutes } from '../../src/outrights/routes.js'

const outrightServiceMocks = vi.hoisted(() => ({
  getOutrights: vi.fn(),
  createOutrightPrediction: vi.fn(),
  getLeagueOutrightPredictions: vi.fn(),
}))

vi.mock('../../src/outrights/service.js', () => outrightServiceMocks)

describe('Outright markets (integration)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(outrightRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  describe('GET /api/v1/outrights', () => {
    it('returns the active outright catalog for the authenticated user', async () => {
      outrightServiceMocks.getOutrights.mockResolvedValue([
        {
          id: 'champion',
          name: 'Campeao',
          pointValue: 120,
          options: [],
          selectionMin: 1,
          selectionMax: 1,
          status: 'OPEN',
          optionType: 'TEAM',
          userPrediction: null,
          userSelections: [],
        },
        {
          id: 'best-goalkeeper',
          name: 'Melhor Goleiro',
          pointValue: 70,
          options: [],
          selectionMin: 1,
          selectionMax: 1,
          status: 'OPEN',
          optionType: 'PLAYER',
          userPrediction: null,
          userSelections: [],
        },
        {
          id: 'finalists',
          name: 'Finalistas',
          pointValue: 90,
          options: [],
          selectionMin: 2,
          selectionMax: 2,
          status: 'OPEN',
          optionType: 'TEAM',
          userPrediction: null,
          userSelections: [],
        },
      ])

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/outrights',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(outrightServiceMocks.getOutrights).toHaveBeenCalledWith('user-1')
      expect(response.json()).toEqual({
        markets: expect.arrayContaining([
          expect.objectContaining({ name: 'Campeao', pointValue: 120 }),
          expect.objectContaining({ name: 'Melhor Goleiro', pointValue: 70, optionType: 'PLAYER' }),
          expect.objectContaining({ name: 'Finalistas', pointValue: 90, selectionMax: 2 }),
        ]),
      })
    })

    it('returns 401 when no auth token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/outrights',
      })

      expect(response.statusCode).toBe(401)
      expect(outrightServiceMocks.getOutrights).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/v1/outrights/:marketId/predictions', () => {
    it('accepts a single optionId payload for single-selection markets', async () => {
      outrightServiceMocks.createOutrightPrediction.mockResolvedValue({
        message: 'Palpite registrado',
        optionIds: ['option-1'],
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/outrights/champion/predictions',
        headers: { authorization: `Bearer ${token}` },
        payload: { optionId: '11111111-1111-1111-1111-111111111111' },
      })

      expect(response.statusCode).toBe(201)
      expect(outrightServiceMocks.createOutrightPrediction).toHaveBeenCalledWith(
        'user-1',
        'champion',
        ['11111111-1111-1111-1111-111111111111'],
      )
    })

    it('accepts exactly two optionIds for Finalistas submissions', async () => {
      outrightServiceMocks.createOutrightPrediction.mockResolvedValue({
        message: 'Palpite registrado',
        optionIds: [
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
        ],
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/outrights/finalists/predictions',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          optionIds: [
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
          ],
        },
      })

      expect(response.statusCode).toBe(201)
      expect(outrightServiceMocks.createOutrightPrediction).toHaveBeenCalledWith(
        'user-1',
        'finalists',
        [
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
        ],
      )
    })
  })

  describe('GET /api/v1/leagues/:leagueId/outrights/:marketId/predictions', () => {
    it('returns league-scoped outright selections for all active members', async () => {
      outrightServiceMocks.getLeagueOutrightPredictions.mockResolvedValue([
        {
          userId: 'user-1',
          displayName: 'Gus',
          avatarUrl: null,
          submittedAt: '2026-05-20T12:00:00.000Z',
          selections: [{ optionId: 'option-1', label: 'Brasil', teamFlagUrl: 'https://flags/bra.png' }],
        },
        {
          userId: 'user-2',
          displayName: 'Ana',
          avatarUrl: null,
          submittedAt: null,
          selections: [],
        },
      ])

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/leagues/league-1/outrights/market-1/predictions',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(outrightServiceMocks.getLeagueOutrightPredictions).toHaveBeenCalledWith('user-1', 'league-1', 'market-1')
      expect(response.json()).toMatchObject({
        leagueId: 'league-1',
        marketId: 'market-1',
        predictions: [
          expect.objectContaining({ userId: 'user-1' }),
          expect.objectContaining({ userId: 'user-2', selections: [] }),
        ],
      })
    })
  })
})
