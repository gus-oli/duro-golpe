import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { matchResults, matches } from '../db/schema/index.js'
import { eq, and } from 'drizzle-orm'
import {
  publishMatchResultConfirmed,
  publishMatchScoreLive,
  publishScoringMatchResultConfirmed,
  publishMatchStatusChanged,
} from '../realtime/publisher.js'
import { mapApiFootballStatus } from '../realtime/events.js'

interface ApiFootballWebhookBody {
  fixture?: {
    id?: number
    status?: { short?: string }
  }
  goals?: {
    home?: number | null
    away?: number | null
  }
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/webhooks/api-football', async (request, reply) => {
    const secret = request.headers['x-webhook-secret']
    if (secret !== config.WEBHOOK_SECRET) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const body = request.body as ApiFootballWebhookBody
    app.log.info({ body }, 'Webhook received')

    const statusShort = body?.fixture?.status?.short
    const homeGoals = body?.goals?.home
    const awayGoals = body?.goals?.away
    const apiId = body?.fixture?.id
    const mappedStatus = mapApiFootballStatus(statusShort)

    if (mappedStatus === 'LIVE' && apiId != null) {
      const apiFootballId = String(apiId)
      const [match] = await db
        .select({ id: matches.id })
        .from(matches)
        .where(eq(matches.apiFootballId, apiFootballId))
        .limit(1)

      if (match) {
        await db
          .update(matches)
          .set({
            status: 'LIVE',
            homeScore: homeGoals ?? null,
            awayScore: awayGoals ?? null,
          })
          .where(eq(matches.id, match.id))

        await publishMatchStatusChanged({
          matchId: match.id,
          status: 'LIVE',
          changedAt: new Date().toISOString(),
        })

        if (homeGoals != null && awayGoals != null) {
          await publishMatchScoreLive({
            matchId: match.id,
            homeScore: homeGoals,
            awayScore: awayGoals,
            status: 'LIVE',
            updatedAt: new Date().toISOString(),
          })
        }
      }
    }

    if (mappedStatus === 'FINISHED' && homeGoals != null && awayGoals != null && apiId != null) {
      const apiFootballId = String(apiId)

      const [match] = await db
        .select({ id: matches.id })
        .from(matches)
        .where(eq(matches.apiFootballId, apiFootballId))
        .limit(1)

      if (match) {
        // Idempotency: skip if a CONFIRMED result already exists for this match
        const existing = await db
          .select({ id: matchResults.id })
          .from(matchResults)
          .where(and(eq(matchResults.matchId, match.id), eq(matchResults.status, 'CONFIRMED')))
          .limit(1)

        if (existing.length === 0) {
          const [result] = await db
            .insert(matchResults)
            .values({
              matchId: match.id,
              homeScore: homeGoals,
              awayScore: awayGoals,
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            })
            .returning()

          await db
            .update(matches)
            .set({ status: 'FINISHED', homeScore: homeGoals, awayScore: awayGoals })
            .where(eq(matches.id, match.id))

          const confirmedAt = result!.confirmedAt?.toISOString() ?? new Date().toISOString()
          await publishMatchStatusChanged({
            matchId: match.id,
            status: 'FINISHED',
            changedAt: confirmedAt,
          })
          await publishMatchScoreLive({
            matchId: match.id,
            homeScore: homeGoals,
            awayScore: awayGoals,
            status: 'FINISHED',
            updatedAt: confirmedAt,
          })
          await publishMatchResultConfirmed({
            matchId: match.id,
            matchResultId: result!.id,
            homeGoals,
            awayGoals,
            confirmedAt,
            source: 'api-football-v3',
          })
          await publishScoringMatchResultConfirmed({
            matchId: match.id,
            matchResultId: result!.id,
            homeGoals,
            awayGoals,
            confirmedAt,
            source: 'api-football-v3',
          })

          app.log.info({ matchId: match.id, homeGoals, awayGoals }, 'Match result confirmed')
        } else {
          app.log.info({ matchId: match.id }, 'Duplicate webhook ignored')
        }
      }
    }

    return reply.status(200).send({ received: true })
  })
}
