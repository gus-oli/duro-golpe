import type { BadgeEvaluationContext, ScoringTier } from './types.js'

const CORRECT_TIERS: ScoringTier[] = ['EXACT_SCORE', 'WINNER_AND_GOAL_DIFF', 'WINNER_OR_DRAW']

export function isCorrectResult(tier: ScoringTier): boolean {
  return CORRECT_TIERS.includes(tier)
}

export function shouldAwardOMestre(ctx: Pick<BadgeEvaluationContext, 'consecutiveCorrect'>): boolean {
  return ctx.consecutiveCorrect >= 5
}

export function shouldAwardPeFrio(ctx: Pick<BadgeEvaluationContext, 'consecutiveIncorrect'>): boolean {
  return ctx.consecutiveIncorrect >= 5
}

export function shouldAwardZebraHunter(
  ctx: Pick<BadgeEvaluationContext, 'isZebraMatch' | 'tier'>,
): boolean {
  return ctx.isZebraMatch && isCorrectResult(ctx.tier)
}

export function shouldAwardPrimeiraCravada(ctx: Pick<BadgeEvaluationContext, 'exactScoreCount'>): boolean {
  return ctx.exactScoreCount >= 1
}

export function shouldAwardHatTrickExato(ctx: Pick<BadgeEvaluationContext, 'exactScoreCount'>): boolean {
  return ctx.exactScoreCount >= 3
}

export function shouldAwardReiDoSaldo(ctx: Pick<BadgeEvaluationContext, 'winnerGoalDiffCount'>): boolean {
  return ctx.winnerGoalDiffCount >= 5
}

export function shouldAwardGolDeHonra(ctx: Pick<BadgeEvaluationContext, 'matchPoints'>): boolean {
  return ctx.matchPoints > 0
}

export function shouldAwardRegularidade(ctx: Pick<BadgeEvaluationContext, 'positiveMatchScoreCount'>): boolean {
  return ctx.positiveMatchScoreCount >= 10
}

export function shouldAwardVoltaPorCima(
  ctx: Pick<BadgeEvaluationContext, 'tier' | 'previousConsecutiveIncorrect'>,
): boolean {
  return isCorrectResult(ctx.tier) && ctx.previousConsecutiveIncorrect >= 3
}
