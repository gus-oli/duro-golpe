import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../auth/middleware.js'
import { validateQuery } from '../middleware/validate.js'
import { db } from '../db/index.js'
import { matchScores, userTotals, users, matches, matchPredictions, matchResults } from '../db/schema/index.js'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { TIER_LABELS_PT, MAX_THEORETICAL_POINTS } from './types.js'
import type { ScoringTier } from './types.js'

const matchScoresQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function scoringRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/users/:userId/score — UserTotal summary
  app.get<{ Params: { userId: string } }>(
    '/api/v1/users/:userId/score',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { userId } = request.params

      const [userTotal] = await db
        .select()
        .from(userTotals)
        .where(eq(userTotals.userId, userId))
        .limit(1)

      if (!userTotal) {
        // Return zero total if user has no scores yet
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
        if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' })

        return reply.send({
          userId,
          totalPoints: 0,
          matchPoints: 0,
          outrightPoints: 0,
          maxTheoreticalPoints: MAX_THEORETICAL_POINTS,
          progressPercent: 0,
          exactScoreCount: 0,
          winnerGoalDiffCount: 0,
          lastUpdatedAt: null,
        })
      }

      const progressPercent = Math.round((userTotal.totalPoints / MAX_THEORETICAL_POINTS) * 1000) / 10

      return reply.send({
        userId,
        totalPoints: userTotal.totalPoints,
        matchPoints: userTotal.matchPoints,
        outrightPoints: userTotal.outrightPoints,
        maxTheoreticalPoints: MAX_THEORETICAL_POINTS,
        progressPercent,
        exactScoreCount: userTotal.exactScoreCount,
        winnerGoalDiffCount: userTotal.winnerGoalDiffCount,
        lastUpdatedAt: userTotal.lastUpdatedAt.toISOString(),
      })
    },
  )

  // GET /api/v1/users/:userId/scores/matches — paginated match score breakdown
  app.get<{ Params: { userId: string } }>(
    '/api/v1/users/:userId/scores/matches',
    { preHandler: [requireAuth, validateQuery(matchScoresQuerySchema)] },
    async (request, reply) => {
      const { userId } = request.params
      const { page, limit } = request.query as z.infer<typeof matchScoresQuerySchema>
      const offset = (page - 1) * limit

      const rows = await db
        .select({
          matchId: matches.id,
          matchDate: matches.kickoffTime,
          homeTeamId: matches.homeTeamId,
          awayTeamId: matches.awayTeamId,
          predictedHome: matchPredictions.predictedHome,
          predictedAway: matchPredictions.predictedAway,
          actualHome: matchResults.homeScore,
          actualAway: matchResults.awayScore,
          tier: matchScores.tier,
          points: matchScores.points,
          isSuperseded: matchScores.isSuperseded,
          calculatedAt: matchScores.calculatedAt,
        })
        .from(matchScores)
        .innerJoin(matchPredictions, eq(matchScores.predictionId, matchPredictions.id))
        .innerJoin(matches, eq(matchScores.matchId, matches.id))
        .innerJoin(matchResults, eq(matchScores.matchResultId, matchResults.id))
        .where(and(eq(matchScores.userId, userId), eq(matchScores.isSuperseded, false)))
        .orderBy(desc(matches.kickoffTime))
        .limit(limit + 1)
        .offset(offset)

      const [totalRow] = await db
        .select({ total: count() })
        .from(matchScores)
        .where(and(eq(matchScores.userId, userId), eq(matchScores.isSuperseded, false)))

      const hasMore = rows.length > limit
      const items = rows.slice(0, limit).map((r) => ({
        matchId: r.matchId,
        matchDate: r.matchDate.toISOString(),
        prediction: { home: r.predictedHome, away: r.predictedAway },
        result: { home: r.actualHome, away: r.actualAway },
        tier: r.tier,
        tierLabel: TIER_LABELS_PT[r.tier as ScoringTier] ?? r.tier,
        points: r.points,
        isSuperseded: r.isSuperseded,
        calculatedAt: r.calculatedAt.toISOString(),
      }))

      return reply.send({
        page,
        limit,
        total: totalRow?.total ?? 0,
        items,
      })
    },
  )

  // GET /api/v1/matches/:matchId/score-summary — tier distribution for a match
  app.get<{ Params: { matchId: string } }>(
    '/api/v1/matches/:matchId/score-summary',
    { preHandler: requireAuth },
    async (request, reply) => {
      const { matchId } = request.params

      const [result] = await db
        .select({ homeScore: matchResults.homeScore, awayScore: matchResults.awayScore })
        .from(matchResults)
        .where(and(eq(matchResults.matchId, matchId), eq(matchResults.status, 'CONFIRMED')))
        .limit(1)

      const rows = await db
        .select({ tier: matchScores.tier, cnt: count() })
        .from(matchScores)
        .where(and(eq(matchScores.matchId, matchId), eq(matchScores.isSuperseded, false)))
        .groupBy(matchScores.tier)

      const totalPredictions = rows.reduce((sum, r) => sum + Number(r.cnt), 0)

      const tierBreakdown = Object.fromEntries(
        rows.map((r) => [
          r.tier,
          {
            count: Number(r.cnt),
            percent: totalPredictions > 0 ? Math.round((Number(r.cnt) / totalPredictions) * 1000) / 10 : 0,
          },
        ]),
      )

      return reply.send({
        matchId,
        result: result ? { home: result.homeScore, away: result.awayScore } : null,
        totalPredictions,
        tierBreakdown,
      })
    },
  )
}
