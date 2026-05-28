import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { accountRoutes } from '../../src/account/routes.js'

const accountServiceMocks = vi.hoisted(() => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  changeMyPassword: vi.fn(),
}))

vi.mock('../../src/account/service.js', () => accountServiceMocks)

describe('Account routes (integration)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(accountRoutes)
    token = app.jwt.sign({ sub: 'user-1' })
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  it('returns the authenticated profile on GET /api/v1/me', async () => {
    accountServiceMocks.getMyProfile.mockResolvedValue({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana',
      avatarUrl: null,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(accountServiceMocks.getMyProfile).toHaveBeenCalledWith('user-1')
    expect(response.json()).toMatchObject({
      user: {
        id: 'user-1',
        email: 'ana@example.com',
        displayName: 'Ana',
      },
    })
  })

  it('updates display name and email on PATCH /api/v1/me', async () => {
    accountServiceMocks.updateMyProfile.mockResolvedValue({
      id: 'user-1',
      email: 'ana@example.com',
      displayName: 'Ana Costa',
      avatarUrl: null,
    })

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/me',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: {
        displayName: 'Ana Costa',
        email: 'ana@example.com',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(accountServiceMocks.updateMyProfile).toHaveBeenCalledWith('user-1', {
      displayName: 'Ana Costa',
      email: 'ana@example.com',
    })
  })

  it('propagates duplicate email conflicts on PATCH /api/v1/me', async () => {
    accountServiceMocks.updateMyProfile.mockRejectedValue(
      Object.assign(new Error('E-mail ja cadastrado'), { statusCode: 409 }),
    )

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/me',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: {
        displayName: 'Ana Costa',
        email: 'ana@example.com',
      },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json()).toMatchObject({ message: 'E-mail ja cadastrado' })
  })

  it('requires the current password on POST /api/v1/me/password', async () => {
    accountServiceMocks.changeMyPassword.mockRejectedValue(
      Object.assign(new Error('Senha atual incorreta'), { statusCode: 400 }),
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/me/password',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: {
        currentPassword: 'errada',
        newPassword: 'NovaSenha1!',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ message: 'Senha atual incorreta' })
  })

  it('rejects weak new passwords on POST /api/v1/me/password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/me/password',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: {
        currentPassword: 'Atual1!',
        newPassword: 'fraca123',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ message: 'Dados invÃ¡lidos' })
    expect(response.json()).toMatchObject({
      details: [
        expect.objectContaining({
          field: 'newPassword',
          message: 'A senha precisa ter pelo menos 8 caracteres, com letra minúscula, letra maiúscula, número e símbolo.',
        }),
      ],
    })
    expect(accountServiceMocks.changeMyPassword).not.toHaveBeenCalled()
  })
})
