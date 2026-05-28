import type { FastifyInstance } from 'fastify'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'

const SESSION_MAX_AGE = '7d'

export interface SessionPayload {
  sub: string
  sv: number
  iat?: number
  exp?: number
}

export interface SessionUserLike {
  id: string
  sessionVersion: number
}

export function issueSessionToken(app: FastifyInstance, user: SessionUserLike): string {
  return app.jwt.sign(
    { sub: user.id, sv: user.sessionVersion },
    { expiresIn: SESSION_MAX_AGE },
  )
}

export async function isSessionPayloadCurrent(payload: SessionPayload): Promise<boolean> {
  if (process.env['NODE_ENV'] === 'test' && process.env['AUTH_ENFORCE_SESSION_VERSION'] !== 'true') {
    return true
  }

  const [user] = await db
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1)

  return Boolean(user && user.sessionVersion === payload.sv)
}

export async function bumpSessionVersion(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, userId))
}
