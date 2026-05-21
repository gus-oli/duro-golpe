import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { validateBody } from '../middleware/validate.js'
import { changeMyPassword, getMyProfile, updateMyProfile } from './service.js'

const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  email: z.string().trim().email('E-mail invalido'),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export async function accountRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/me', { preHandler: requireAuth }, async (request, reply) => {
    const profile = await getMyProfile(request.user.id)
    return reply.send({ user: profile })
  })

  app.patch(
    '/api/v1/me',
    {
      preHandler: [requireAuth, validateBody(profileUpdateSchema)],
    },
    async (request, reply) => {
      const profile = await updateMyProfile(request.user.id, request.body as z.infer<typeof profileUpdateSchema>)
      return reply.send({ user: profile })
    },
  )

  app.post(
    '/api/v1/me/password',
    {
      preHandler: [requireAuth, validateBody(passwordChangeSchema)],
    },
    async (request, reply) => {
      await changeMyPassword(request.user.id, request.body as z.infer<typeof passwordChangeSchema>)
      return reply.send({ ok: true })
    },
  )
}
