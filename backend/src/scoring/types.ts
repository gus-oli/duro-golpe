import { OUTRIGHT_MARKET_TOTAL_POINTS } from '../outrights/catalog.js'
import { TOURNAMENT_MATCH_COUNT } from '../tournament/constants.js'

export type ScoringTier =
  | 'EXACT_SCORE'
  | 'WINNER_AND_GOAL_DIFF'
  | 'WINNER_OR_DRAW'
  | 'ONE_TEAM_GOALS'
  | 'TOTAL_MISS'

export const TIER_POINTS: Record<ScoringTier, number> = {
  EXACT_SCORE: 25,
  WINNER_AND_GOAL_DIFF: 15,
  WINNER_OR_DRAW: 10,
  ONE_TEAM_GOALS: 5,
  TOTAL_MISS: 0,
}

export const TIER_LABELS_PT: Record<ScoringTier, string> = {
  EXACT_SCORE: 'Placar Exato',
  WINNER_AND_GOAL_DIFF: 'Vencedor + Saldo de Gols',
  WINNER_OR_DRAW: 'Vencedor ou Empate',
  ONE_TEAM_GOALS: 'Acerto de Gols de um Time',
  TOTAL_MISS: 'Erro Total',
}

export interface PredictionData {
  predictedHome: number
  predictedAway: number
}

export interface MatchResultData {
  homeScore: number
  awayScore: number
}

export interface ScoringResult {
  tier: ScoringTier
  points: number
}

export const MAX_THEORETICAL_POINTS = TOURNAMENT_MATCH_COUNT * TIER_POINTS.EXACT_SCORE + OUTRIGHT_MARKET_TOTAL_POINTS
