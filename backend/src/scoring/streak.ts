import { db } from '../db/index.js'
import { matchScores, matchPredictions, matches } from '../db/schema/index.js'
import { eq, and, desc } from 'drizzle-orm'

export interface StreakResult {
  consecutiveCorrect: number
  consecutiveIncorrect: number
}

const CORRECT_TIERS = new Set(['EXACT_SCORE', 'WINNER_AND_GOAL_DIFF', 'WINNER_OR_DRAW'])

export async function getStreaks(userId: string): Promise<StreakResult> {
  // Get all non-superseded scores for this user, ordered by match kickoff time DESC
  const rows = await db
    .select({
      tier: matchScores.tier,
    })
    .from(matchScores)
    .innerJoin(matchPredictions, eq(matchScores.predictionId, matchPredictions.id))
    .innerJoin(matches, eq(matchPredictions.matchId, matches.id))
    .where(and(eq(matchScores.userId, userId), eq(matchScores.isSuperseded, false)))
    .orderBy(desc(matches.kickoffTime))

  let consecutiveCorrect = 0
  let consecutiveIncorrect = 0
  let correctStreakBroken = false
  let incorrectStreakBroken = false

  for (const row of rows) {
    const isCorrect = CORRECT_TIERS.has(row.tier)
    const isMiss = row.tier === 'TOTAL_MISS'

    if (!correctStreakBroken) {
      if (isCorrect) {
        consecutiveCorrect++
      } else {
        correctStreakBroken = true
      }
    }

    if (!incorrectStreakBroken) {
      if (isMiss) {
        consecutiveIncorrect++
      } else {
        incorrectStreakBroken = true
      }
    }

    if (correctStreakBroken && incorrectStreakBroken) break
  }

  return { consecutiveCorrect, consecutiveIncorrect }
}
