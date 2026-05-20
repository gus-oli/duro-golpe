import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { validateBody } from '../middleware/validate.js'
import {
  createPrediction,
  updatePrediction,
  getPredictionByUser,
  savePredictionsBatch,
  getLeagueMatchPredictions,
} from './service.js'

const predictionSchema = z.object({
  predictedHome: z.number().int().min(0).max(99),
  predictedAway: z.number().int().min(0).max(99),
})

const batchPredictionSchema = z.object({
  predictions: z
    .array(
      z.object({
        matchId: z.string().uuid(),
        predictedHome: z.number().int().min(0).max(99),
        predictedAway: z.number().int().min(0).max(99),
      }),
    )
    .min(1)
    .max(64),
})

export async function predictionRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/v1/predictions/batch',
    { preHandler: [requireAuth, validateBody(batchPredictionSchema)] },
    async (request, reply) => {
      const body = request.body as z.infer<typeof batchPredictionSchema>
      const result = await savePredictionsBatch(request.user.id, body.predictions)
      return reply.send(result)
    },
  )

  app.post<{ Params: { matchId: string } }>(
    '/api/v1/matches/:matchId/predictions',
    { preHandler: [requireAuth, validateBody(predictionSchema)] },
    async (request, reply) => {
      const { matchId } = request.params
      const { predictedHome, predictedAway } = request.body as z.infer<typeof predictionSchema>
      const prediction = await createPrediction(request.user.id, matchId, predictedHome, predictedAway)
      return reply.status(201).send(prediction)
    },
  )

  app.put<{ Params: { matchId: string } }>(
    '/api/v1/matches/:matchId/predictions',
    { preHandler: [requireAuth, validateBody(predictionSchema)] },
    async (request, reply) => {
      const { matchId } = request.params
      const { predictedHome, predictedAway } = request.body as z.infer<typeof predictionSchema>
      const prediction = await updatePrediction(request.user.id, matchId, predictedHome, predictedAway)
      return reply.send(prediction)
    },
  )

  app.get<{ Params: { matchId: string } }>(
    '/api/v1/matches/:matchId/predictions/me',
    { preHandler: requireAuth },
    async (request, reply) => {
      const prediction = await getPredictionByUser(request.user.id, request.params.matchId)
      if (!prediction) {
        return reply.status(404).send({ statusCode: 404, message: 'Nenhum palpite enviado' })
      }
      return reply.send(prediction)
    },
  )

  app.get<{ Params: { leagueId: string; matchId: string } }>(
    '/api/v1/leagues/:leagueId/matches/:matchId/predictions',
    { preHandler: requireAuth },
    async (request, reply) => {
      const predictions = await getLeagueMatchPredictions(request.user.id, request.params.leagueId, request.params.matchId)
      return reply.send({
        leagueId: request.params.leagueId,
        matchId: request.params.matchId,
        predictions,
      })
    },
  )
}
