import Fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Webhook handler (integration)', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    process.env['DATABASE_URL'] = 'postgresql://duro_golpe:duro_golpe_dev@localhost:5432/duro_golpe'
    process.env['REDIS_URL'] = 'redis://localhost:6379'
    process.env['JWT_SECRET'] = 'x'.repeat(32)
    process.env['API_FOOTBALL_KEY'] = 'test-api-football-key'
    process.env['WEBHOOK_SECRET'] = 'super-secret-123456'
    process.env['BASE_URL'] = 'http://localhost:3001'
    process.env['FRONTEND_URL'] = 'http://localhost:3000'

    vi.resetModules()
    const { webhookRoutes } = await import('../../src/data-providers/webhook-handler.js')
    app = Fastify()
    await app.register(webhookRoutes)
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/v1/webhooks/api-football', () => {
    it('returns 200 with { received: true } when secret matches', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/webhooks/api-football',
        headers: { 'x-webhook-secret': 'super-secret-123456' },
        payload: {},
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ received: true })
    })

    it('returns 401 when x-webhook-secret header is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/webhooks/api-football',
        payload: {},
      })

      expect(response.statusCode).toBe(401)
    })

    it('returns 401 when x-webhook-secret header does not match', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/webhooks/api-football',
        headers: { 'x-webhook-secret': 'wrong-secret' },
        payload: {},
      })

      expect(response.statusCode).toBe(401)
    })
  })
})
