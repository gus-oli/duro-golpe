import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { muralRoutes } from '../../src/mural/routes.js'

const muralServiceMocks = vi.hoisted(() => ({
  createPost: vi.fn(),
  getPosts: vi.fn(),
  hidePostForActor: vi.fn(),
}))

vi.mock('../../src/mural/service.js', () => muralServiceMocks)

describe('League social feed security (integration)', () => {
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
    await app.register(muralRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  it('denies hide requests when the actor is not allowed to hide the target post', async () => {
    muralServiceMocks.hidePostForActor.mockRejectedValue(Object.assign(new Error('Acesso negado'), { statusCode: 403 }))

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/leagues/league-1/mural/post-1/hide',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: 'Acesso negado' })
    expect(muralServiceMocks.hidePostForActor).toHaveBeenCalledWith('user-1', 'league-1', 'post-1')
  })

  it('denies hide requests when the post does not belong to the claimed league context', async () => {
    muralServiceMocks.hidePostForActor.mockRejectedValue(
      Object.assign(new Error('Post do mural nao encontrado'), { statusCode: 404 }),
    )

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/leagues/league-1/matches/match-1/mural/post-9/hide',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: 'Post do mural nao encontrado' })
    expect(muralServiceMocks.hidePostForActor).toHaveBeenCalledWith('user-1', 'league-1', 'post-9')
  })

  it('denies league feed reads when the user is not an active member of the league', async () => {
    muralServiceMocks.getPosts.mockRejectedValue(Object.assign(new Error('Acesso negado'), { statusCode: 403 }))

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/leagues/league-2/mural',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ message: 'Acesso negado' })
    expect(muralServiceMocks.getPosts).toHaveBeenCalledWith('user-1', 'league-2', 50, undefined, undefined)
  })
})
