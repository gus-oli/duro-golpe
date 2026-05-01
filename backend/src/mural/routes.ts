import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../auth/middleware.js'
import { validateBody, validateQuery } from '../middleware/validate.js'
import { db } from '../db/index.js'
import { muralPosts } from '../db/schema/index.js'
import { createPost, getPosts } from './service.js'

const postBodySchema = z.object({
  content: z.string().min(1, 'Conteúdo não pode ser vazio').max(500, 'Conteúdo não pode exceder 500 caracteres'),
})

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
})

type RouteParams = { Params: { leagueId: string; matchId: string } }
type PostParams = { Params: { leagueId: string; matchId: string; postId: string } }

export async function muralRoutes(app: FastifyInstance): Promise<void> {
  app.get<RouteParams>(
    '/api/v1/leagues/:leagueId/matches/:matchId/mural',
    { preHandler: [requireAuth, validateQuery(querySchema)] },
    async (request, reply) => {
      const { leagueId, matchId } = request.params
      const { limit, before } = request.query as z.infer<typeof querySchema>
      const result = await getPosts(request.user.id, leagueId, matchId, limit, before)
      return reply.send({ leagueId, matchId, ...result })
    },
  )

  app.post<RouteParams>(
    '/api/v1/leagues/:leagueId/matches/:matchId/mural',
    { preHandler: [requireAuth, validateBody(postBodySchema)] },
    async (request, reply) => {
      const { leagueId, matchId } = request.params
      const { content } = request.body as z.infer<typeof postBodySchema>
      const post = await createPost(request.user.id, leagueId, matchId, content)
      return reply.status(201).send({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
      })
    },
  )

  // Moderation stub (T041) — no admin role system in v1; auth required
  app.patch<PostParams>(
    '/api/v1/leagues/:leagueId/matches/:matchId/mural/:postId/hide',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { postId } = request.params
      await db.update(muralPosts).set({ isHidden: true }).where(eq(muralPosts.id, postId))
      return reply.status(200).send({ hidden: true })
    },
  )
}
