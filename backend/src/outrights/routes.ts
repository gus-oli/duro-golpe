import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { validateBody, validateParams } from '../middleware/validate.js'
import { getOutrights, createOutrightPrediction, getLeagueOutrightPredictions } from './service.js'
import { routeIdSchema } from '../middleware/route-schemas.js'
import { rateLimit } from '../middleware/rate-limit.js'

const outrightPredictionBody = z
  .union([
    z.object({ optionId: z.string().uuid() }),
    z.object({ optionIds: z.array(z.string().uuid()).min(1) }),
  ])
  .transform((body) => ('optionId' in body ? { optionIds: [body.optionId] } : body))

const marketParamsSchema = z.object({ marketId: routeIdSchema })
const leagueMarketParamsSchema = z.object({ leagueId: routeIdSchema, marketId: routeIdSchema })

export async function outrightRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/outrights', { preHandler: requireAuth }, async (request, reply) => {
    const markets = await getOutrights(request.user.id)
    return reply.send({ markets })
  })

  app.post<{ Params: { marketId: string } }>(
    '/api/v1/outrights/:marketId/predictions',
    {
      preHandler: [
        requireAuth,
        validateParams(marketParamsSchema),
        validateBody(outrightPredictionBody),
        rateLimit({ key: 'outright-prediction', windowMs: 5 * 60 * 1000, max: 30 }),
      ],
    },
    async (request, reply) => {
      const { marketId } = request.params
      const { optionIds } = request.body as { optionIds: string[] }
      const prediction = await createOutrightPrediction(request.user.id, marketId, optionIds)
      return reply.status(201).send({ marketId, ...prediction })
    },
  )

  app.get<{ Params: { leagueId: string; marketId: string } }>(
    '/api/v1/leagues/:leagueId/outrights/:marketId/predictions',
    { preHandler: [requireAuth, validateParams(leagueMarketParamsSchema)] },
    async (request, reply) => {
      const predictions = await getLeagueOutrightPredictions(request.user.id, request.params.leagueId, request.params.marketId)
      return reply.send({
        leagueId: request.params.leagueId,
        marketId: request.params.marketId,
        predictions,
      })
    },
  )
}
