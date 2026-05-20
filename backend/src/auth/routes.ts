import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'
import { validateBody } from '../middleware/validate.js'
import { confirmPasswordReset, requestPasswordReset } from './password-recovery.js'

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  displayName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const passwordResetRequestSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const passwordResetConfirmSchema = z.object({
  token: z.string().min(32, 'Token inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/v1/auth/register',
    { preHandler: validateBody(registerSchema) },
    async (request, reply) => {
      const { email, displayName, password } = request.body as z.infer<typeof registerSchema>

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existing.length > 0) {
        return reply.status(409).send({ statusCode: 409, error: 'Conflict', message: 'E-mail já cadastrado' })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const [user] = await db
        .insert(users)
        .values({ email, displayName, passwordHash })
        .returning({ id: users.id, email: users.email, displayName: users.displayName })

      const token = app.jwt.sign({ sub: user!.id }, { expiresIn: '7d' })
      return reply.status(201).send({ token, user })
    },
  )

  app.post(
    '/api/v1/auth/login',
    { preHandler: validateBody(loginSchema) },
    async (request, reply) => {
      const { email, password } = request.body as z.infer<typeof loginSchema>

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (!user || !user.passwordHash) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Credenciais inválidas' })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Credenciais inválidas' })
      }

      const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' })
      return reply.send({
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
      })
    },
  )

  app.post(
    '/api/v1/auth/password-reset/request',
    { preHandler: validateBody(passwordResetRequestSchema) },
    async (request, reply) => {
      const { email } = request.body as z.infer<typeof passwordResetRequestSchema>
      await requestPasswordReset(email)
      return reply.send({ ok: true, message: 'Se o e-mail existir, enviaremos um link de recuperação.' })
    },
  )

  app.post(
    '/api/v1/auth/password-reset/confirm',
    { preHandler: validateBody(passwordResetConfirmSchema) },
    async (request, reply) => {
      const { token, password } = request.body as z.infer<typeof passwordResetConfirmSchema>
      await confirmPasswordReset(token, password)
      return reply.send({ ok: true })
    },
  )
}
