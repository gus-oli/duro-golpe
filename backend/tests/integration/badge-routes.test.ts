import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { badgeRoutes } from '../../src/badges/routes.js'

describe('Badge routes security (integration)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    app.setErrorHandler((error, _request, reply) => {
      const typedError = error as { statusCode?: number; name?: string; message?: string }
      const statusCode = typedError.statusCode ?? 500
      return reply.status(statusCode).send({
        statusCode,
        error: typedError.name ?? 'Error',
        message: typedError.message ?? 'Erro na requisicao',
      })
    })
    await app.register(badgeRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    await app.close()
  })

  it('denies cross-user badge reads for authenticated users outside the declared visibility policy', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/users/user-2/badges',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: 'Acesso negado' })
  })
})
