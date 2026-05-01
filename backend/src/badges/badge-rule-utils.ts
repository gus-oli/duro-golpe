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
  return ctx.isZebraMatch && ctx.tier !== 'TOTAL_MISS'
}
