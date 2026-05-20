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

describe('Prediction routes', () => {
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

  it('keeps single-match prediction creation working', async () => {
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
  })

  it('accepts a batch payload and returns per-item results', async () => {
    predictionServiceMocks.savePredictionsBatch.mockResolvedValue({
      saved: [
        {
          id: 'pred-1',
          matchId: '550e8400-e29b-41d4-a716-446655440001',
          userId: 'user-1',
          predictedHome: 2,
          predictedAway: 1,
        },
      ],
      failed: [
        {
          matchId: '550e8400-e29b-41d4-a716-446655440002',
          message: 'Palpites encerrados para esta partida',
          statusCode: 403,
        },
      ],
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
      saved: [{ matchId: '550e8400-e29b-41d4-a716-446655440001' }],
      failed: [{ matchId: '550e8400-e29b-41d4-a716-446655440002', statusCode: 403 }],
    })
  })
})
