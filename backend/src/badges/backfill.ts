import { asc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matches, matchPredictions, matchScores } from '../db/schema/index.js'
import { isCorrectResult } from './badge-rule-utils.js'
import { runEvaluation } from './evaluator.js'
import { seedBadges } from './seed.js'
import type { BadgeEvaluationContext, ScoringTier } from './types.js'
import { isPredictionSocialUnderdog } from '../matches/social-odds.js'

export interface BadgeBackfillScoreRow {
  userId: string
  matchId: string
  tier: ScoringTier
  points: number
  isZebraMatch?: boolean
}

interface UserBackfillState {
  consecutiveCorrect: number
  consecutiveIncorrect: number
  exactScoreCount: number
  winnerGoalDiffCount: number
  matchPoints: number
  positiveMatchIds: Set<string>
}

export interface BadgeBackfillResult {
  evaluatedScores: number
  users: number
  dryRun: boolean
}

function getUserState(states: Map<string, UserBackfillState>, userId: string): UserBackfillState {
  const existing = states.get(userId)
  if (existing) return existing

  const created = {
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    exactScoreCount: 0,
    winnerGoalDiffCount: 0,
    matchPoints: 0,
    positiveMatchIds: new Set<string>(),
  }
  states.set(userId, created)
  return created
}

export function buildBadgeBackfillContexts(rows: BadgeBackfillScoreRow[]): BadgeEvaluationContext[] {
  const states = new Map<string, UserBackfillState>()
  const contexts: BadgeEvaluationContext[] = []

  for (const row of rows) {
    const state = getUserState(states, row.userId)
    const previousConsecutiveIncorrect = state.consecutiveIncorrect

    if (row.tier === 'EXACT_SCORE') state.exactScoreCount += 1
    if (row.tier === 'WINNER_AND_GOAL_DIFF') state.winnerGoalDiffCount += 1
    if (row.points > 0) state.positiveMatchIds.add(row.matchId)
    state.matchPoints += row.points

    if (isCorrectResult(row.tier)) {
      state.consecutiveCorrect += 1
    } else {
      state.consecutiveCorrect = 0
    }

    if (row.tier === 'TOTAL_MISS') {
      state.consecutiveIncorrect += 1
    } else {
      state.consecutiveIncorrect = 0
    }

    contexts.push({
      userId: row.userId,
      matchId: row.matchId,
      tier: row.tier,
      isZebraMatch: row.isZebraMatch ?? false,
      consecutiveCorrect: state.consecutiveCorrect,
      consecutiveIncorrect: state.consecutiveIncorrect,
      exactScoreCount: state.exactScoreCount,
      winnerGoalDiffCount: state.winnerGoalDiffCount,
      matchPoints: state.matchPoints,
      positiveMatchScoreCount: state.positiveMatchIds.size,
      previousConsecutiveIncorrect,
    })
  }

  return contexts
}

async function loadBackfillRows(): Promise<BadgeBackfillScoreRow[]> {
  const rows = await db
    .select({
      userId: matchScores.userId,
      matchId: matchScores.matchId,
      predictedHome: matchPredictions.predictedHome,
      predictedAway: matchPredictions.predictedAway,
      tier: matchScores.tier,
      points: matchScores.points,
    })
    .from(matchScores)
    .innerJoin(matches, eq(matchScores.matchId, matches.id))
    .innerJoin(matchPredictions, eq(matchScores.predictionId, matchPredictions.id))
    .where(eq(matchScores.isSuperseded, false))
    .orderBy(asc(matches.kickoffTime), asc(matchScores.calculatedAt), asc(matchScores.id))

  return Promise.all(rows.map(async (row) => ({
    userId: row.userId,
    matchId: row.matchId,
    tier: row.tier as ScoringTier,
    points: row.points,
    isZebraMatch: await isPredictionSocialUnderdog({
      matchId: row.matchId,
      predictedHome: row.predictedHome,
      predictedAway: row.predictedAway,
    }),
  })))
}

export async function backfillBadges(options: { dryRun?: boolean } = {}): Promise<BadgeBackfillResult> {
  const dryRun = options.dryRun ?? false
  await seedBadges()

  const rows = await loadBackfillRows()
  const contexts = buildBadgeBackfillContexts(rows)

  if (!dryRun) {
    for (const context of contexts) {
      await runEvaluation(context, { notify: false })
    }
  }

  return {
    evaluatedScores: contexts.length,
    users: new Set(rows.map((row) => row.userId)).size,
    dryRun,
  }
}

if (process.argv[1]?.endsWith('backfill.ts')) {
  const dryRun = process.argv.includes('--dry-run')
  backfillBadges({ dryRun })
    .then((result) => {
      const suffix = result.dryRun ? ' (dry run)' : ''
      console.info(`[BadgeBackfill] Evaluated ${result.evaluatedScores} scores for ${result.users} users${suffix}`)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
