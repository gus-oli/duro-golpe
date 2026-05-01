import type { FastifyInstance } from 'fastify'
import { getMatches, getMatchById } from './service.js'

export async function matchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/matches', async (request, reply) => {
    const query = request.query as { stage?: string }
    const result = await getMatches(query.stage ? { stage: query.stage } : undefined)
    return reply.send({ matches: result, total: result.length })
  })

  app.get<{ Params: { matchId: string } }>(
    '/api/v1/matches/:matchId',
    async (request, reply) => {
      const match = await getMatchById(request.params.matchId)
      if (!match) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Partida não encontrada' })
      }
      return reply.send(match)
    },
  )
}
