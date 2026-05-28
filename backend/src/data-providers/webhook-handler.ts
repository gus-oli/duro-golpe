import type { FastifyInstance } from 'fastify'
import { timingSafeEqual } from 'node:crypto'
import { config } from '../config.js'
import { mapApiFootballStatus } from '../realtime/events.js'
import { applyProviderMatchSnapshot } from './match-reconciliation.js'
import { rateLimit } from '../middleware/rate-limit.js'

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

function hasValidWebhookSecret(input: string | undefined): boolean {
  if (!input) {
    return false
  }

  const expected = Buffer.from(config.WEBHOOK_SECRET)
  const provided = Buffer.from(input)
  if (expected.length !== provided.length) {
    return false
  }

  return timingSafeEqual(expected, provided)
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/webhooks/api-football', {
    preHandler: rateLimit({ key: 'webhook-api-football', windowMs: 60 * 1000, max: 120 }),
  }, async (request, reply) => {
    const secret = request.headers['x-webhook-secret']
    if (!hasValidWebhookSecret(Array.isArray(secret) ? secret[0] : secret)) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const body = request.body as ApiFootballWebhookBody
    app.log.info({ body }, 'Webhook received')

    const statusShort = body?.fixture?.status?.short
    const homeGoals = body?.goals?.home
    const awayGoals = body?.goals?.away
    const apiId = body?.fixture?.id
    const mappedStatus = mapApiFootballStatus(statusShort)

    if (mappedStatus && apiId != null) {
      await applyProviderMatchSnapshot({
        providerMatchId: String(apiId),
        status: mappedStatus,
        homeScore: homeGoals ?? null,
        awayScore: awayGoals ?? null,
        changedAt: new Date(),
        source: 'api-football-v3',
      })
    }

    return reply.status(200).send({ received: true })
  })
}
