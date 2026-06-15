import { db } from '../db/index.js'
import { matchScores, matchPredictions, matches } from '../db/schema/index.js'
import { eq, and, desc, gt, lt, sql } from 'drizzle-orm'

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

export async function getPositiveMatchScoreCount(userId: string): Promise<number> {
  const [row] = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${matchScores.matchId})`,
    })
    .from(matchScores)
    .where(and(eq(matchScores.userId, userId), eq(matchScores.isSuperseded, false), gt(matchScores.points, 0)))

  return Number(row?.count ?? 0)
}

export async function getPreviousConsecutiveIncorrect(userId: string, matchId: string): Promise<number> {
  const [currentMatch] = await db
    .select({ kickoffTime: matches.kickoffTime })
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1)

  if (!currentMatch) return 0

  const rows = await db
    .select({ tier: matchScores.tier })
    .from(matchScores)
    .innerJoin(matches, eq(matchScores.matchId, matches.id))
    .where(
      and(
        eq(matchScores.userId, userId),
        eq(matchScores.isSuperseded, false),
        lt(matches.kickoffTime, currentMatch.kickoffTime),
      ),
    )
    .orderBy(desc(matches.kickoffTime))

  let consecutiveIncorrect = 0
  for (const row of rows) {
    if (row.tier !== 'TOTAL_MISS') break
    consecutiveIncorrect++
  }

  return consecutiveIncorrect
}
