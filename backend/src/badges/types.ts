export type ScoringTier =
  | 'EXACT_SCORE'
  | 'WINNER_AND_GOAL_DIFF'
  | 'WINNER_OR_DRAW'
  | 'ONE_TEAM_GOALS'
  | 'TOTAL_MISS'

export interface BadgeEvaluationContext {
  userId: string
  matchId: string
  tier: ScoringTier
  isZebraMatch: boolean
  consecutiveCorrect: number
  consecutiveIncorrect: number
}

export type BadgeEvaluationResult = 'awarded' | 'incremented' | null

export interface BadgeRule {
  evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult>
}
