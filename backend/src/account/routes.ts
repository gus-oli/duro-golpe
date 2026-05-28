import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../auth/password-policy.js'
import { validateBody } from '../middleware/validate.js'
import { changeMyPassword, getMyProfile, updateMyProfile } from './service.js'
import { rateLimit } from '../middleware/rate-limit.js'

const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  email: z.string().trim().email('E-mail invalido'),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().refine(isStrongPassword, PASSWORD_POLICY_MESSAGE),
})

export async function accountRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/me', { preHandler: requireAuth }, async (request, reply) => {
    const profile = await getMyProfile(request.user.id)
    return reply.send({ user: profile })
  })

  app.patch(
    '/api/v1/me',
    {
      preHandler: [
        requireAuth,
        validateBody(profileUpdateSchema),
        rateLimit({ key: 'account-update-profile', windowMs: 5 * 60 * 1000, max: 20 }),
      ],
    },
    async (request, reply) => {
      const profile = await updateMyProfile(request.user.id, request.body as z.infer<typeof profileUpdateSchema>)
      return reply.send({ user: profile })
    },
  )

  app.post(
    '/api/v1/me/password',
    {
      preHandler: [
        requireAuth,
        validateBody(passwordChangeSchema),
        rateLimit({ key: 'account-change-password', windowMs: 15 * 60 * 1000, max: 10 }),
      ],
    },
    async (request, reply) => {
      await changeMyPassword(request.user.id, request.body as z.infer<typeof passwordChangeSchema>)
      return reply.send({ ok: true })
    },
  )
}
