import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { leagueMemberships, userTotals } from '../db/schema/index.js'
import { eq, and } from 'drizzle-orm'
import { sendToUser } from '../realtime/user-sessions.js'

interface UserTotalsUpdatedEvent {
  event: string
  matchId: string | null
  affectedUserIds: string[]
}

export async function startScoreBroadcaster(): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  await subscriber.connect()

  await subscriber.subscribe('user.totals.updated', async (message) => {
    try {
      const event = JSON.parse(message) as UserTotalsUpdatedEvent
      const { matchId, affectedUserIds } = event

      for (const userId of affectedUserIds) {
        const [total] = await db
          .select()
          .from(userTotals)
          .where(eq(userTotals.userId, userId))
          .limit(1)

        if (total) {
          sendToUser(userId, {
            type: 'score:total:updated',
            totalPoints: total.totalPoints,
            matchPoints: total.matchPoints,
            outrightPoints: total.outrightPoints,
            exactScoreCount: total.exactScoreCount,
            winnerGoalDiffCount: total.winnerGoalDiffCount,
          })

          if (matchId) {
            sendToUser(userId, {
              type: 'score:match:updated',
              matchId,
            })
          }
        }

        const memberships = await db
          .select({ leagueId: leagueMemberships.leagueId })
          .from(leagueMemberships)
          .where(and(eq(leagueMemberships.userId, userId), eq(leagueMemberships.isActive, true)))

        for (const { leagueId } of memberships) {
          const leagueMembers = await db
            .select({ userId: leagueMemberships.userId })
            .from(leagueMemberships)
            .where(and(eq(leagueMemberships.leagueId, leagueId), eq(leagueMemberships.isActive, true)))

          for (const { userId: memberId } of leagueMembers) {
            sendToUser(memberId, {
              type: 'ranking:updated',
              leagueId,
            })
          }
        }
      }
    } catch (err) {
      console.error('[ScoreBroadcaster] Error processing user.totals.updated:', err)
    }
  })

  console.info('[ScoreBroadcaster] Subscribed to user.totals.updated Redis channel')
}
