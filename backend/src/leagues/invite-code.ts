import { randomBytes } from 'crypto'
import { db } from '../db/index.js'
import { leagues } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'

export async function generateInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = randomBytes(6).toString('base64url').slice(0, 8).toUpperCase()
    const existing = await db.select({ id: leagues.id }).from(leagues).where(eq(leagues.inviteCode, code)).limit(1)
    if (existing.length === 0) return code
  }
  throw new Error('Failed to generate unique invite code after 3 attempts')
}
