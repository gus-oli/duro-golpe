import type { MatchResultData, PredictionData, ScoringResult, ScoringTier } from './types.js'
import { TIER_POINTS } from './types.js'

function sign(n: number): -1 | 0 | 1 {
  if (n > 0) return 1
  if (n < 0) return -1
  return 0
}

export function calculateTier(prediction: PredictionData, result: MatchResultData): ScoringTier {
  const { predictedHome: pH, predictedAway: pA } = prediction
  const { homeScore: rH, awayScore: rA } = result

  if (pH === rH && pA === rA) return 'EXACT_SCORE'

  const predictedDiff = pH - pA
  const actualDiff = rH - rA
  const predictedOutcome = sign(predictedDiff)
  const actualOutcome = sign(actualDiff)

  // Approved launch rule: correct winner (non-draw) + same goal difference earns 15,
  // even when one side of the prediction is zero.
  if (predictedOutcome !== 0 && predictedOutcome === actualOutcome && predictedDiff === actualDiff) {
    return 'WINNER_AND_GOAL_DIFF'
  }

  if (predictedOutcome === actualOutcome) {
    if (predictedOutcome === 0) return 'WINNER_OR_DRAW'
    if (predictedDiff !== actualDiff) return 'WINNER_OR_DRAW'
    if (Math.abs(rH - pH) === 1) return 'WINNER_OR_DRAW'
  }

  if (predictedOutcome !== 0) {
    if (predictedOutcome > 0 && pH === rH && pA !== rA) return 'ONE_TEAM_GOALS'
    if (predictedOutcome < 0 && pA === rA && pH !== rH) return 'ONE_TEAM_GOALS'
  }

  return 'TOTAL_MISS'
}

export function score(prediction: PredictionData, result: MatchResultData): ScoringResult {
  const tier = calculateTier(prediction, result)
  return { tier, points: TIER_POINTS[tier] }
}
