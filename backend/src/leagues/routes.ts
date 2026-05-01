import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { validateBody } from '../middleware/validate.js'
import { createLeague, joinLeague, getMyLeagues, getLeagueRanking } from './service.js'

export async function leagueRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/v1/leagues',
    { preHandler: [requireAuth, validateBody(z.object({ name: z.string().min(3).max(50) }))] },
    async (request, reply) => {
      const { name } = request.body as { name: string }
      const league = await createLeague(request.user.id, name)
      return reply.status(201).send(league)
    },
  )

  app.post(
    '/api/v1/leagues/join',
    { preHandler: [requireAuth, validateBody(z.object({ inviteCode: z.string().length(8) }))] },
    async (request, reply) => {
      const { inviteCode } = request.body as { inviteCode: string }
      const membership = await joinLeague(request.user.id, inviteCode)
      return reply.send(membership)
    },
  )

  app.get('/api/v1/leagues', { preHandler: requireAuth }, async (request, reply) => {
    const myLeagues = await getMyLeagues(request.user.id)
    return reply.send({ leagues: myLeagues })
  })

  app.get<{ Params: { leagueId: string } }>(
    '/api/v1/leagues/:leagueId/ranking',
    { preHandler: requireAuth },
    async (request, reply) => {
      const ranking = await getLeagueRanking(request.params.leagueId, request.user.id)
      return reply.send({ ranking })
    },
  )
}
