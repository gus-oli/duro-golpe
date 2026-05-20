import { db } from '../db/index.js'
import { badges, leagues, leagueMemberships, userBadges, users, userTotals } from '../db/schema/index.js'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { generateInviteCode } from './invite-code.js'
import type { League, LeagueMembership } from '../db/schema/leagues.js'

export async function createLeague(userId: string, name: string): Promise<League> {
  const inviteCode = await generateInviteCode()
  return db.transaction(async (tx) => {
    const [league] = await tx
      .insert(leagues)
      .values({ name, inviteCode, createdBy: userId })
      .returning()
    await tx.insert(leagueMemberships).values({ leagueId: league!.id, userId, isActive: true })
    return league!
  })
}

export async function joinLeague(userId: string, inviteCode: string): Promise<LeagueMembership> {
  const [league] = await db
    .select()
    .from(leagues)
    .where(eq(leagues.inviteCode, inviteCode.toUpperCase()))
    .limit(1)

  if (!league) {
    const err = Object.assign(new Error('Liga não encontrada'), { statusCode: 404 })
    throw err
  }

  const existing = await db
    .select()
    .from(leagueMemberships)
    .where(and(eq(leagueMemberships.leagueId, league.id), eq(leagueMemberships.userId, userId)))
    .limit(1)

  if (existing.length > 0) {
    const err = Object.assign(new Error('Você já faz parte desta liga'), { statusCode: 409 })
    throw err
  }

  const [membership] = await db
    .insert(leagueMemberships)
    .values({ leagueId: league.id, userId, isActive: true })
    .returning()

  return membership!
}

export async function getMyLeagues(userId: string): Promise<League[]> {
  const memberships = await db
    .select({ league: leagues })
    .from(leagueMemberships)
    .innerJoin(leagues, eq(leagueMemberships.leagueId, leagues.id))
    .where(and(eq(leagueMemberships.userId, userId), eq(leagueMemberships.isActive, true)))

  return memberships.map((m) => m.league)
}

export interface RankingEntry {
  userId: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
  position: number
  badges: Array<{
    type: string
    labelPt: string
    descriptionPt: string
    iconKey: string
    zebraCount: number | null
  }>
}

export async function getLeagueRanking(leagueId: string, requestingUserId: string): Promise<RankingEntry[]> {
  const membership = await db
    .select()
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, requestingUserId),
        eq(leagueMemberships.isActive, true),
      ),
    )
    .limit(1)

  if (membership.length === 0) {
    const err = Object.assign(new Error('Acesso negado'), { statusCode: 403 })
    throw err
  }

  const members = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalPoints: sql<number>`COALESCE(${userTotals.totalPoints}, 0)`,
      exactScoreCount: sql<number>`COALESCE(${userTotals.exactScoreCount}, 0)`,
      winnerGoalDiffCount: sql<number>`COALESCE(${userTotals.winnerGoalDiffCount}, 0)`,
    })
    .from(leagueMemberships)
    .innerJoin(users, eq(leagueMemberships.userId, users.id))
    .leftJoin(userTotals, eq(users.id, userTotals.userId))
    .where(and(eq(leagueMemberships.leagueId, leagueId), eq(leagueMemberships.isActive, true)))
    .orderBy(
      desc(sql`COALESCE(${userTotals.totalPoints}, 0)`),
      desc(sql`COALESCE(${userTotals.exactScoreCount}, 0)`),
      desc(sql`COALESCE(${userTotals.winnerGoalDiffCount}, 0)`),
      asc(users.displayName),
    )

  const memberIds = members.map((member) => member.userId)
  const badgeRows =
    memberIds.length === 0
      ? []
      : await db
          .select({
            userId: userBadges.userId,
            type: badges.type,
            labelPt: badges.labelPt,
            descriptionPt: badges.descriptionPt,
            iconKey: badges.iconKey,
            zebraCount: userBadges.zebraCount,
          })
          .from(userBadges)
          .innerJoin(badges, eq(userBadges.badgeType, badges.type))
          .where(inArray(userBadges.userId, memberIds))
          .orderBy(userBadges.awardedAt)

  const badgesByUser = new Map<string, RankingEntry['badges']>()
  for (const badgeRow of badgeRows) {
    const current = badgesByUser.get(badgeRow.userId) ?? []
    current.push({
      type: badgeRow.type,
      labelPt: badgeRow.labelPt,
      descriptionPt: badgeRow.descriptionPt,
      iconKey: badgeRow.iconKey,
      zebraCount: badgeRow.type === 'ZEBRA_HUNTER' ? badgeRow.zebraCount : null,
    })
    badgesByUser.set(badgeRow.userId, current)
  }

  return members.map((m, idx) => ({
    ...m,
    totalPoints: Number(m.totalPoints),
    exactScoreCount: Number(m.exactScoreCount),
    winnerGoalDiffCount: Number(m.winnerGoalDiffCount),
    position: idx + 1,
    badges: badgesByUser.get(m.userId) ?? [],
  }))
}
