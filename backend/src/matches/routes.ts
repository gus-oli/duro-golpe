import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getMatches, getMatchById } from './service.js'
import { validateParams, validateQuery } from '../middleware/validate.js'
import { routeIdSchema } from '../middleware/route-schemas.js'

const matchParamsSchema = z.object({ matchId: routeIdSchema })
const matchQuerySchema = z.object({
  stage: z.string().trim().min(1).max(64).optional(),
})

export async function matchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/matches', { preHandler: validateQuery(matchQuerySchema) }, async (request, reply) => {
    const query = request.query as z.infer<typeof matchQuerySchema>
    let userId: string | undefined

    try {
      await request.jwtVerify()
      userId = request.user.id
    } catch {
      userId = undefined
    }

    const result = await getMatches(query.stage ? { stage: query.stage } : undefined, userId)
    return reply.send({ matches: result, total: result.length })
  })

  app.get<{ Params: { matchId: string } }>(
    '/api/v1/matches/:matchId',
    { preHandler: validateParams(matchParamsSchema) },
    async (request, reply) => {
      const match = await getMatchById(request.params.matchId)
      if (!match) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Partida não encontrada' })
      }
      return reply.send(match)
    },
  )
}
