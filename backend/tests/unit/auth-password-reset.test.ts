import Fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const recoveryMocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}))

vi.mock('../../src/auth/password-recovery.js', () => recoveryMocks)

describe('Password reset routes', () => {
  let app: FastifyInstance
  let authRoutes: typeof import('../../src/auth/routes.js').authRoutes

  beforeEach(async () => {
    process.env.DATABASE_URL = 'postgresql://duro_golpe:duro_golpe_dev@localhost:5432/duro_golpe'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.JWT_SECRET = 'x'.repeat(32)
    process.env.WEBHOOK_SECRET = 'y'.repeat(16)
    process.env.BASE_URL = 'http://localhost:3001'
    process.env.FRONTEND_URL = 'http://localhost:3000'
    process.env.NODE_ENV = 'test'

    ;({ authRoutes } = await import('../../src/auth/routes.js'))

    app = Fastify()
    app.setErrorHandler((error, _request, reply) => {
      const typedError = error as { statusCode?: number; name?: string; message?: string }
      const statusCode = typedError.statusCode ?? 500
      return reply.status(statusCode).send({
        statusCode,
        error: typedError.name ?? 'Error',
        message: typedError.message ?? 'Erro na requisicao',
      })
    })
    await app.register(authRoutes)
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await app.close()
  })

  it('returns a generic success response for password reset requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/password-reset/request',
      payload: { email: 'user@example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      ok: true,
      message: 'Se o e-mail existir, enviaremos um link de recuperação.',
    })
    expect(recoveryMocks.requestPasswordReset).toHaveBeenCalledWith('user@example.com')
  })

  it('confirms the password reset with a valid token payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/password-reset/confirm',
      payload: { token: 'x'.repeat(64), password: 'NovaSenha1!' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ ok: true })
    expect(recoveryMocks.confirmPasswordReset).toHaveBeenCalledWith('x'.repeat(64), 'NovaSenha1!')
  })

  it('returns the recovery service error when a reset token is invalid', async () => {
    recoveryMocks.confirmPasswordReset.mockRejectedValueOnce(
      Object.assign(new Error('Link de recuperação inválido ou expirado'), { statusCode: 400 }),
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/password-reset/confirm',
      payload: { token: 'x'.repeat(64), password: 'NovaSenha1!' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ message: 'Link de recuperação inválido ou expirado' })
  })

  it('rejects weak passwords before calling the recovery service', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/password-reset/confirm',
      payload: { token: 'x'.repeat(64), password: 'fraca123' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ message: 'Dados inválidos' })
    expect(response.json()).toMatchObject({
      details: [
        expect.objectContaining({
          field: 'password',
          message: 'A senha precisa ter pelo menos 8 caracteres, com letra minúscula, letra maiúscula, número e símbolo.',
        }),
      ],
    })
    expect(recoveryMocks.confirmPasswordReset).not.toHaveBeenCalled()
  })
})
