import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { matchScores } from '../db/schema/index.js'
import { eq, and } from 'drizzle-orm'
import { getStreaks } from './streak.js'
import { recomputeUserTotal } from './totals.js'

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

        if (matchScore) {
          const streaks = await getStreaks(userId)
          await publisher.publish(
            'badge.evaluate',
            JSON.stringify({
              event: 'badge.evaluate',
              userId,
              matchId,
              tier: matchScore.tier,
              isZebraMatch: false, // populated by scoring engine when API-Football provides underdog flag
              consecutiveCorrect: streaks.consecutiveCorrect,
              consecutiveIncorrect: streaks.consecutiveIncorrect,
            }),
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
