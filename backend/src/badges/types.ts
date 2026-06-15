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
  exactScoreCount: number
  winnerGoalDiffCount: number
  matchPoints: number
  positiveMatchScoreCount: number
  previousConsecutiveIncorrect: number
}

export type BadgeEvaluationResult = 'awarded' | 'incremented' | null

export type BadgeType =
  | 'O_MESTRE'
  | 'PE_FRIO'
  | 'ZEBRA_HUNTER'
  | 'PRIMEIRA_CRAVADA'
  | 'HAT_TRICK_EXATO'
  | 'REI_DO_SALDO'
  | 'GOL_DE_HONRA'
  | 'REGULARIDADE'
  | 'VOLTA_POR_CIMA'

export interface BadgeRule {
  badgeType: BadgeType
  evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult>
}
