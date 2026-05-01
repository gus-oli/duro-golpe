import { and, count, eq, sql, sum } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matchScores, outrightScores, userTotals } from '../db/schema/index.js'

interface BuildUserTotalSnapshotInput {
  matchPoints: number
  outrightPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
}

export function buildUserTotalSnapshot({
  matchPoints,
  outrightPoints,
  exactScoreCount,
  winnerGoalDiffCount,
}: BuildUserTotalSnapshotInput) {
  return {
    totalPoints: matchPoints + outrightPoints,
    matchPoints,
    outrightPoints,
    exactScoreCount,
    winnerGoalDiffCount,
  }
}

export async function recomputeUserTotal(userId: string): Promise<void> {
  const [[matchAgg], [outrightAgg]] = await Promise.all([
    db
      .select({
        matchPoints: sum(matchScores.points),
        exactScoreCount: count(sql`CASE WHEN ${matchScores.tier} = 'EXACT_SCORE' THEN 1 END`),
        winnerGoalDiffCount: count(sql`CASE WHEN ${matchScores.tier} = 'WINNER_AND_GOAL_DIFF' THEN 1 END`),
      })
      .from(matchScores)
      .where(and(eq(matchScores.userId, userId), eq(matchScores.isSuperseded, false))),
    db
      .select({
        outrightPoints: sum(outrightScores.points),
      })
      .from(outrightScores)
      .where(eq(outrightScores.userId, userId)),
  ])

  const snapshot = buildUserTotalSnapshot({
    matchPoints: Number(matchAgg?.matchPoints ?? 0),
    outrightPoints: Number(outrightAgg?.outrightPoints ?? 0),
    exactScoreCount: Number(matchAgg?.exactScoreCount ?? 0),
    winnerGoalDiffCount: Number(matchAgg?.winnerGoalDiffCount ?? 0),
  })

  await db
    .insert(userTotals)
    .values({
      userId,
      totalPoints: snapshot.totalPoints,
      matchPoints: snapshot.matchPoints,
      outrightPoints: snapshot.outrightPoints,
      exactScoreCount: snapshot.exactScoreCount,
      winnerGoalDiffCount: snapshot.winnerGoalDiffCount,
      lastUpdatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userTotals.userId,
      set: {
        totalPoints: sql`excluded.total_points`,
        matchPoints: sql`excluded.match_points`,
        outrightPoints: sql`excluded.outright_points`,
        exactScoreCount: sql`excluded.exact_score_count`,
        winnerGoalDiffCount: sql`excluded.winner_goal_diff_count`,
        lastUpdatedAt: sql`excluded.last_updated_at`,
      },
    })
}
