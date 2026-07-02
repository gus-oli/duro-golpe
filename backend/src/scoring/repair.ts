import { and, eq, ne, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matchPredictions, matchResults, matchScores } from '../db/schema/index.js'
import { score } from './engine.js'
import { recomputeUserTotal } from './totals.js'

export interface RepairConfirmedMatchScoresSummary {
  confirmedResults: number
  predictionsScored: number
  usersRecomputed: number
}

interface RepairConfirmedMatchScoresOptions {
  onProgress?: (message: string) => void
}

export async function repairConfirmedMatchScores(
  options: RepairConfirmedMatchScoresOptions = {},
): Promise<RepairConfirmedMatchScoresSummary> {
  const confirmedResults = await db
    .select({
      id: matchResults.id,
      matchId: matchResults.matchId,
      homeScore: matchResults.homeScore,
      awayScore: matchResults.awayScore,
    })
    .from(matchResults)
    .where(eq(matchResults.status, 'CONFIRMED'))

  options.onProgress?.(`Found ${confirmedResults.length} confirmed result(s) to reconcile.`)

  let predictionsScored = 0
  const affectedUserIds = new Set<string>()

  for (const [index, result] of confirmedResults.entries()) {
    const [predictions, activeScores] = await Promise.all([
      db
        .select()
        .from(matchPredictions)
        .where(eq(matchPredictions.matchId, result.matchId)),
      db
        .select({ userId: matchScores.userId })
        .from(matchScores)
        .where(and(eq(matchScores.matchId, result.matchId), eq(matchScores.isSuperseded, false))),
    ])

    options.onProgress?.(
      `Reconciling result ${index + 1}/${confirmedResults.length}: match=${result.matchId} predictions=${predictions.length}`,
    )

    for (const activeScore of activeScores) {
      affectedUserIds.add(activeScore.userId)
    }

    await db
      .update(matchScores)
      .set({ isSuperseded: true })
      .where(
        and(
          eq(matchScores.matchId, result.matchId),
          eq(matchScores.isSuperseded, false),
          ne(matchScores.matchResultId, result.id),
        ),
      )

    for (const prediction of predictions) {
      const scoring = score(
        { predictedHome: prediction.predictedHome, predictedAway: prediction.predictedAway },
        { homeScore: result.homeScore, awayScore: result.awayScore },
      )

      await db
        .insert(matchScores)
        .values({
          userId: prediction.userId,
          matchId: result.matchId,
          predictionId: prediction.id,
          matchResultId: result.id,
          tier: scoring.tier,
          points: scoring.points,
          isSuperseded: false,
          calculatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [matchScores.predictionId, matchScores.matchResultId],
          set: {
            tier: sql`excluded.tier`,
            points: sql`excluded.points`,
            isSuperseded: false,
            calculatedAt: sql`excluded.calculated_at`,
          },
        })

      predictionsScored += 1
      affectedUserIds.add(prediction.userId)
    }
  }

  options.onProgress?.(`Recomputing totals for ${affectedUserIds.size} affected user(s).`)

  for (const userId of affectedUserIds) {
    await recomputeUserTotal(userId)
  }

  return {
    confirmedResults: confirmedResults.length,
    predictionsScored,
    usersRecomputed: affectedUserIds.size,
  }
}
