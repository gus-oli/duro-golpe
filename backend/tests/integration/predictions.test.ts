import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { predictionRoutes } from '../../src/predictions/routes.js'

const predictionServiceMocks = vi.hoisted(() => ({
  createPrediction: vi.fn(),
  updatePrediction: vi.fn(),
  getPredictionByUser: vi.fn(),
  savePredictionsBatch: vi.fn(),
}))

vi.mock('../../src/predictions/service.js', () => predictionServiceMocks)

describe('Prediction endpoints (integration)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(predictionRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  describe('POST /api/v1/matches/:matchId/predictions', () => {
    it('returns 201 when user submits a prediction for a scheduled match', async () => {
      predictionServiceMocks.createPrediction.mockResolvedValue({
        id: 'pred-1',
        matchId: 'match-1',
        userId: 'user-1',
        predictedHome: 2,
        predictedAway: 1,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/matches/match-1/predictions',
        headers: { authorization: `Bearer ${token}` },
        payload: { predictedHome: 2, predictedAway: 1 },
      })

      expect(response.statusCode).toBe(201)
      expect(predictionServiceMocks.createPrediction).toHaveBeenCalledWith('user-1', 'match-1', 2, 1)
      expect(response.json()).toMatchObject({
        id: 'pred-1',
        predictedHome: 2,
        predictedAway: 1,
      })
    })

    it('returns 401 when no auth token is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/matches/match-1/predictions',
        payload: { predictedHome: 2, predictedAway: 1 },
      })

      expect(response.statusCode).toBe(401)
      expect(predictionServiceMocks.createPrediction).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/v1/predictions/batch', () => {
    it('returns per-item results for batch prediction submissions', async () => {
      predictionServiceMocks.savePredictionsBatch.mockResolvedValue({
        saved: [
          {
            id: 'pred-1',
            matchId: 'match-1',
            userId: 'user-1',
            predictedHome: 2,
            predictedAway: 1,
          },
        ],
        failed: [{ matchId: 'match-2', message: 'Palpites encerrados para esta partida', statusCode: 403 }],
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/predictions/batch',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          predictions: [
            { matchId: '550e8400-e29b-41d4-a716-446655440001', predictedHome: 2, predictedAway: 1 },
            { matchId: '550e8400-e29b-41d4-a716-446655440002', predictedHome: 0, predictedAway: 0 },
          ],
        },
      })

      expect(response.statusCode).toBe(200)
      expect(predictionServiceMocks.savePredictionsBatch).toHaveBeenCalledWith('user-1', [
        { matchId: '550e8400-e29b-41d4-a716-446655440001', predictedHome: 2, predictedAway: 1 },
        { matchId: '550e8400-e29b-41d4-a716-446655440002', predictedHome: 0, predictedAway: 0 },
      ])
      expect(response.json()).toMatchObject({
        saved: [
          {
            id: 'pred-1',
            predictedHome: 2,
            predictedAway: 1,
          },
        ],
        failed: [{ matchId: 'match-2', statusCode: 403 }],
      })
    })

    it('rejects invalid batch payloads before calling the service', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/predictions/batch',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          predictions: [{ matchId: 'not-a-uuid', predictedHome: 2, predictedAway: 1 }],
        },
      })

      expect(response.statusCode).toBe(400)
      expect(predictionServiceMocks.savePredictionsBatch).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/v1/matches/:matchId/predictions', () => {
    it('returns 200 when user updates an existing prediction', async () => {
      predictionServiceMocks.updatePrediction.mockResolvedValue({
        id: 'pred-1',
        matchId: 'match-1',
        userId: 'user-1',
        predictedHome: 3,
        predictedAway: 1,
      })

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/matches/match-1/predictions',
        headers: { authorization: `Bearer ${token}` },
        payload: { predictedHome: 3, predictedAway: 1 },
      })

      expect(response.statusCode).toBe(200)
      expect(predictionServiceMocks.updatePrediction).toHaveBeenCalledWith('user-1', 'match-1', 3, 1)
      expect(response.json()).toMatchObject({
        predictedHome: 3,
        predictedAway: 1,
      })
    })
  })

  describe('GET /api/v1/matches/:matchId/predictions/me', () => {
    it('returns 404 when the user has not predicted the match yet', async () => {
      predictionServiceMocks.getPredictionByUser.mockResolvedValue(undefined)

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/matches/match-1/predictions/me',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(404)
      expect(response.json()).toMatchObject({ message: 'Nenhum palpite enviado' })
    })

    it('returns the persisted prediction for the authenticated user', async () => {
      predictionServiceMocks.getPredictionByUser.mockResolvedValue({
        id: 'pred-1',
        matchId: 'match-1',
        userId: 'user-1',
        predictedHome: 2,
        predictedAway: 1,
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/matches/match-1/predictions/me',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      expect(predictionServiceMocks.getPredictionByUser).toHaveBeenCalledWith('user-1', 'match-1')
      expect(response.json()).toMatchObject({
        predictedHome: 2,
        predictedAway: 1,
      })
    })
  })
})
