import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { matchScores, userTotals } from '../db/schema/index.js'
import { eq, and } from 'drizzle-orm'
import { getPositiveMatchScoreCount, getPreviousConsecutiveIncorrect, getStreaks } from './streak.js'
import { recomputeUserTotal } from './totals.js'
import type { BadgeEvaluationContext } from '../badges/types.js'

interface ScoresUpdatedEvent {
  event: string
  matchId: string | null
  matchResultId: string | null
  affectedUserIds: string[]
}

export async function startAggregator(publisher: ReturnType<typeof createClient>): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  await subscriber.connect()

  await subscriber.subscribe('scores.updated', async (message) => {
    try {
      const event = JSON.parse(message) as ScoresUpdatedEvent
      const { matchId, matchResultId, affectedUserIds } = event

      for (const userId of affectedUserIds) {
        await recomputeUserTotal(userId)

        // Fetch the user's score for this match to publish badge evaluation context
        const [matchScore] =
          matchId && matchResultId
            ? await db
                .select({ tier: matchScores.tier })
                .from(matchScores)
                .where(
                  and(
                    eq(matchScores.userId, userId),
                    eq(matchScores.matchId, matchId),
                    eq(matchScores.matchResultId, matchResultId),
                    eq(matchScores.isSuperseded, false),
                  ),
                )
                .limit(1)
            : []

        if (matchScore && matchId) {
          const [[total], streaks, positiveMatchScoreCount, previousConsecutiveIncorrect] = await Promise.all([
            db
              .select({
                matchPoints: userTotals.matchPoints,
                exactScoreCount: userTotals.exactScoreCount,
                winnerGoalDiffCount: userTotals.winnerGoalDiffCount,
              })
              .from(userTotals)
              .where(eq(userTotals.userId, userId))
              .limit(1),
            getStreaks(userId),
            getPositiveMatchScoreCount(userId),
            getPreviousConsecutiveIncorrect(userId, matchId),
          ])

          const payload: BadgeEvaluationContext & { event: 'badge.evaluate' } = {
            event: 'badge.evaluate',
            userId,
            matchId,
            tier: matchScore.tier as BadgeEvaluationContext['tier'],
            isZebraMatch: false, // populated by scoring engine when API-Football provides underdog flag
            consecutiveCorrect: streaks.consecutiveCorrect,
            consecutiveIncorrect: streaks.consecutiveIncorrect,
            exactScoreCount: Number(total?.exactScoreCount ?? 0),
            winnerGoalDiffCount: Number(total?.winnerGoalDiffCount ?? 0),
            matchPoints: Number(total?.matchPoints ?? 0),
            positiveMatchScoreCount,
            previousConsecutiveIncorrect,
          }

          await publisher.publish(
            'badge.evaluate',
            JSON.stringify(payload),
          )
        }
      }

      // Notify WebSocket broadcaster
      await publisher.publish(
        'user.totals.updated',
        JSON.stringify({
          event: 'user.totals.updated',
          matchId,
          affectedUserIds,
        }),
      )
    } catch (err) {
      console.error('[Aggregator] Error processing scores.updated:', err)
    }
  })

  console.info('[Aggregator] Subscribed to scores.updated Redis channel')
}
