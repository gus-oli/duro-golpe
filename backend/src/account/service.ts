import bcrypt from 'bcryptjs'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'

export interface AccountProfileDto {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}

const accountProfileColumns = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  avatarUrl: users.avatarUrl,
}

async function getUserOrThrow(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw Object.assign(new Error('Usuario nao encontrado'), { statusCode: 404 })
  }

  return user
}

export async function getMyProfile(userId: string): Promise<AccountProfileDto> {
  const [user] = await db.select(accountProfileColumns).from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw Object.assign(new Error('Usuario nao encontrado'), { statusCode: 404 })
  }

  return {
    ...user,
    avatarUrl: user.avatarUrl ?? null,
  }
}

export async function updateMyProfile(
  userId: string,
  input: { displayName: string; email: string },
): Promise<AccountProfileDto> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const displayName = input.displayName.trim()

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, normalizedEmail), ne(users.id, userId)))
    .limit(1)

  if (existing) {
    throw Object.assign(new Error('E-mail ja cadastrado'), { statusCode: 409 })
  }

  const [updated] = await db
    .update(users)
    .set({
      email: normalizedEmail,
      displayName,
    })
    .where(eq(users.id, userId))
    .returning(accountProfileColumns)

  if (!updated) {
    throw Object.assign(new Error('Usuario nao encontrado'), { statusCode: 404 })
  }

  return {
    ...updated,
    avatarUrl: updated.avatarUrl ?? null,
  }
}

export async function changeMyPassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
): Promise<void> {
  const user = await getUserOrThrow(userId)

  if (!user.passwordHash) {
    throw Object.assign(new Error('Sua conta nao permite trocar senha por este fluxo.'), { statusCode: 400 })
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!passwordMatches) {
    throw Object.assign(new Error('Senha atual incorreta'), { statusCode: 400 })
  }

  const nextHash = await bcrypt.hash(input.newPassword, 12)
  await db.update(users).set({ passwordHash: nextHash }).where(eq(users.id, userId))
}
