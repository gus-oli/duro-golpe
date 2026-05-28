import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import { passwordResetTokens, users } from '../db/schema/index.js'
import { config } from '../config.js'
import { sendPasswordResetEmail } from '../email/brevo.js'
import { bumpSessionVersion } from './session-lifecycle.js'

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!config.BREVO_API_KEY || !config.BREVO_SENDER_EMAIL) {
    throw Object.assign(new Error('Recuperação de senha indisponível no momento'), { statusCode: 503 })
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || !user.passwordHash) {
    return
  }

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + config.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60_000)

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  })

  const resetUrl = new URL('/reset-password', config.FRONTEND_URL)
  resetUrl.searchParams.set('token', rawToken)

  await sendPasswordResetEmail({
    to: user.email,
    displayName: user.displayName,
    resetUrl: resetUrl.toString(),
  })
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  const tokenHash = hashToken(token)
  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!record) {
    throw Object.assign(new Error('Link de recuperação inválido ou expirado'), { statusCode: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, record.userId))
    await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id))
  })
  await bumpSessionVersion(record.userId)
}
