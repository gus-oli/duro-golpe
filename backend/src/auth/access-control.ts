import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { leagueMemberships, matches } from '../db/schema/index.js'

function forbidden(message = 'Acesso negado'): Error {
  return Object.assign(new Error(message), { statusCode: 403 })
}

export function assertSelfAccess(requestingUserId: string, targetUserId: string): void {
  if (requestingUserId !== targetUserId) {
    throw forbidden()
  }
}

export async function isActiveLeagueMember(userId: string, leagueId: string): Promise<boolean> {
  const [membership] = await db
    .select({ leagueId: leagueMemberships.leagueId })
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.userId, userId),
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.isActive, true),
      ),
    )
    .limit(1)

  return Boolean(membership)
}

export async function assertActiveLeagueMember(userId: string, leagueId: string): Promise<void> {
  if (!(await isActiveLeagueMember(userId, leagueId))) {
    throw forbidden()
  }
}

export async function matchExists(matchId: string): Promise<boolean> {
  const [match] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1)

  return Boolean(match)
}
