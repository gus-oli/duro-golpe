import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { matchPredictions, matchScores } from '../db/schema/index.js'
import { eq, and, isNull, or } from 'drizzle-orm'
import { score } from './engine.js'

interface MatchResultConfirmedEvent {
  event: string
  matchResultId: string
  matchId: string
  homeGoals: number
  awayGoals: number
  confirmedAt: string
}

interface MatchResultAmendedEvent {
  event: string
  newMatchResultId: string
  previousMatchResultId: string
  matchId: string
  homeGoals: number
  awayGoals: number
}

interface MatchResultCancelledEvent {
  event: string
  matchResultId: string
  matchId: string
}

async function processConfirmed(event: MatchResultConfirmedEvent, publisher: ReturnType<typeof createClient>): Promise<void> {
  const predictions = await db
    .select()
    .from(matchPredictions)
    .where(eq(matchPredictions.matchId, event.matchId))

  const updatedUserIds: string[] = []

  for (const prediction of predictions) {
    const { tier, points } = score(
      { predictedHome: prediction.predictedHome, predictedAway: prediction.predictedAway },
      { homeScore: event.homeGoals, awayScore: event.awayGoals },
    )

    const inserted = await db
      .insert(matchScores)
      .values({
        userId: prediction.userId,
        matchId: event.matchId,
        predictionId: prediction.id,
        matchResultId: event.matchResultId,
        tier,
        points,
        isSuperseded: false,
      })
      .onConflictDoNothing()
      .returning({ id: matchScores.id })

    if (inserted.length > 0) {
      updatedUserIds.push(prediction.userId)
    }
  }

  if (updatedUserIds.length > 0) {
    await publisher.publish(
      'scores.updated',
      JSON.stringify({
        event: 'scores.updated',
        matchId: event.matchId,
        matchResultId: event.matchResultId,
        processedAt: new Date().toISOString(),
        affectedUserIds: updatedUserIds,
      }),
    )
  }
}

async function processAmended(event: MatchResultAmendedEvent, publisher: ReturnType<typeof createClient>): Promise<void> {
  // Mark old scores as superseded
  await db
    .update(matchScores)
    .set({ isSuperseded: true })
    .where(and(eq(matchScores.matchId, event.matchId), eq(matchScores.isSuperseded, false)))

  // Insert new scores using the new match result ID
  const predictions = await db
    .select()
    .from(matchPredictions)
    .where(eq(matchPredictions.matchId, event.matchId))

  const updatedUserIds: string[] = []

  for (const prediction of predictions) {
    const { tier, points } = score(
      { predictedHome: prediction.predictedHome, predictedAway: prediction.predictedAway },
      { homeScore: event.homeGoals, awayScore: event.awayGoals },
    )

    await db
      .insert(matchScores)
      .values({
        userId: prediction.userId,
        matchId: event.matchId,
        predictionId: prediction.id,
        matchResultId: event.newMatchResultId,
        tier,
        points,
        isSuperseded: false,
      })
      .onConflictDoNothing()

    updatedUserIds.push(prediction.userId)
  }

  if (updatedUserIds.length > 0) {
    await publisher.publish(
      'scores.updated',
      JSON.stringify({
        event: 'scores.updated',
        matchId: event.matchId,
        matchResultId: event.newMatchResultId,
        processedAt: new Date().toISOString(),
        affectedUserIds: updatedUserIds,
      }),
    )
  }
}

async function processCancelled(event: MatchResultCancelledEvent, publisher: ReturnType<typeof createClient>): Promise<void> {
  const affected = await db
    .select({ userId: matchScores.userId })
    .from(matchScores)
    .where(and(eq(matchScores.matchId, event.matchId), eq(matchScores.isSuperseded, false)))

  await db
    .update(matchScores)
    .set({ isSuperseded: true })
    .where(and(eq(matchScores.matchId, event.matchId), eq(matchScores.isSuperseded, false)))

  const updatedUserIds = [...new Set(affected.map((r) => r.userId))]

  if (updatedUserIds.length > 0) {
    await publisher.publish(
      'scores.updated',
      JSON.stringify({
        event: 'scores.updated',
        matchId: event.matchId,
        matchResultId: event.matchResultId,
        processedAt: new Date().toISOString(),
        affectedUserIds: updatedUserIds,
      }),
    )
  }
}

export async function startScoringProcessor(): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  const publisher = createClient({ url: config.REDIS_URL })
  await subscriber.connect()
  await publisher.connect()

  await subscriber.subscribe('match.result.confirmed', async (message) => {
    try {
      const event = JSON.parse(message) as MatchResultConfirmedEvent
      await processConfirmed(event, publisher)
    } catch (err) {
      console.error('[ScoringProcessor] Error processing match.result.confirmed:', err)
    }
  })

  await subscriber.subscribe('match.result.amended', async (message) => {
    try {
      const event = JSON.parse(message) as MatchResultAmendedEvent
      await processAmended(event, publisher)
    } catch (err) {
      console.error('[ScoringProcessor] Error processing match.result.amended:', err)
    }
  })

  await subscriber.subscribe('match.result.cancelled', async (message) => {
    try {
      const event = JSON.parse(message) as MatchResultCancelledEvent
      await processCancelled(event, publisher)
    } catch (err) {
      console.error('[ScoringProcessor] Error processing match.result.cancelled:', err)
    }
  })

  console.info('[ScoringProcessor] Subscribed to match result events')
}
