import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'
import { mapApiFootballStatus } from '../realtime/events.js'
import { applyProviderMatchSnapshot } from './match-reconciliation.js'

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
