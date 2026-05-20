import type { FastifyInstance } from 'fastify'
import { assertSelfAccess } from '../auth/access-control.js'
import { requireAuth } from '../auth/middleware.js'
import { db } from '../db/index.js'
import { badges, userBadges, users } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'

export async function badgeRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { userId: string } }>(
    '/api/v1/users/:userId/badges',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { userId } = request.params
      assertSelfAccess(request.user.id, userId)

      const [user] = await db.select({ displayName: users.displayName }).from(users).where(eq(users.id, userId)).limit(1)
      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }

      const earned = await db
        .select({
          type: badges.type,
          labelPt: badges.labelPt,
          descriptionPt: badges.descriptionPt,
          iconKey: badges.iconKey,
          awardedAt: userBadges.awardedAt,
          zebraCount: userBadges.zebraCount,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeType, badges.type))
        .where(eq(userBadges.userId, userId))
        .orderBy(userBadges.awardedAt)

      return reply.send({
        userId,
        displayName: user.displayName,
        badges: earned.map((b) => ({
          ...b,
          awardedAt: b.awardedAt.toISOString(),
          zebraCount: b.type === 'ZEBRA_HUNTER' ? b.zebraCount : null,
        })),
      })
    },
  )
}
