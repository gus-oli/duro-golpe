import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { validateBody, validateQuery } from '../middleware/validate.js'
import { createPost, getPosts, hidePostForActor } from './service.js'

const basePostBodySchema = z.object({
  content: z
    .string()
    .min(1, 'Conteudo nao pode ser vazio')
    .max(500, 'Conteudo nao pode exceder 500 caracteres'),
})

const leaguePostBodySchema = basePostBodySchema.extend({
  matchId: z.string().uuid().optional(),
})

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
  after: z.string().datetime().optional(),
})

type LeagueParams = { Params: { leagueId: string } }
type MatchParams = { Params: { leagueId: string; matchId: string } }
type LeaguePostParams = { Params: { leagueId: string; postId: string } }
type MatchPostParams = { Params: { leagueId: string; matchId: string; postId: string } }

export async function muralRoutes(app: FastifyInstance): Promise<void> {
  app.get<LeagueParams>(
    '/api/v1/leagues/:leagueId/mural',
    { preHandler: [requireAuth, validateQuery(querySchema)] },
    async (request, reply) => {
      const { leagueId } = request.params
      const { limit, before, after } = request.query as z.infer<typeof querySchema>
      const result = await getPosts(request.user.id, leagueId, limit, before, after)
      return reply.send({ leagueId, ...result })
    },
  )

  app.post<LeagueParams>(
    '/api/v1/leagues/:leagueId/mural',
    { preHandler: [requireAuth, validateBody(leaguePostBodySchema)] },
    async (request, reply) => {
      const { leagueId } = request.params
      const { content, matchId } = request.body as z.infer<typeof leaguePostBodySchema>
      const post = await createPost(request.user.id, leagueId, content, matchId)
      return reply.status(201).send(post)
    },
  )

  app.get<MatchParams>(
    '/api/v1/leagues/:leagueId/matches/:matchId/mural',
    { preHandler: [requireAuth, validateQuery(querySchema)] },
    async (request, reply) => {
      const { leagueId, matchId } = request.params
      const { limit, before, after } = request.query as z.infer<typeof querySchema>
      const result = await getPosts(request.user.id, leagueId, limit, before, after, matchId)
      return reply.send({ leagueId, matchId, ...result })
    },
  )

  app.post<MatchParams>(
    '/api/v1/leagues/:leagueId/matches/:matchId/mural',
    { preHandler: [requireAuth, validateBody(basePostBodySchema)] },
    async (request, reply) => {
      const { leagueId, matchId } = request.params
      const { content } = request.body as z.infer<typeof basePostBodySchema>
      const post = await createPost(request.user.id, leagueId, content, matchId)
      return reply.status(201).send(post)
    },
  )

  app.patch<LeaguePostParams>(
    '/api/v1/leagues/:leagueId/mural/:postId/hide',
    { preHandler: requireAuth },
    async (request, reply) =>
      reply.status(200).send(await hidePostForActor(request.user.id, request.params.leagueId, request.params.postId)),
  )

  app.patch<MatchPostParams>(
    '/api/v1/leagues/:leagueId/matches/:matchId/mural/:postId/hide',
    { preHandler: requireAuth },
    async (request, reply) =>
      reply.status(200).send(await hidePostForActor(request.user.id, request.params.leagueId, request.params.postId)),
  )
}
