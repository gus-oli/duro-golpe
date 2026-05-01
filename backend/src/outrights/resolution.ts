import { OUTRIGHT_MARKET_CODES, type OutrightMarketCode } from './catalog.js'
import { normalizeOutrightOptionIds } from './outright-utils.js'

interface CalculateOutrightPointsInput {
  marketCode: OutrightMarketCode
  pointValue: number
  predictedOptionIds: string[]
  resolvedOptionIds: string[]
}

export function calculateOutrightPoints({
  marketCode,
  pointValue,
  predictedOptionIds,
  resolvedOptionIds,
}: CalculateOutrightPointsInput): number {
  const predicted = normalizeOutrightOptionIds(predictedOptionIds)
  const resolved = normalizeOutrightOptionIds(resolvedOptionIds)

  if (marketCode === OUTRIGHT_MARKET_CODES.FINALISTS) {
    if (predicted.length !== 2 || resolved.length !== 2) {
      return 0
    }

    const predictedSet = new Set(predicted)
    const resolvedSet = new Set(resolved)
    return predictedSet.size === resolvedSet.size && [...resolvedSet].every((optionId) => predictedSet.has(optionId))
      ? pointValue
      : 0
  }

  if (predicted.length !== 1 || resolved.length !== 1) {
    return 0
  }

  return predicted[0] === resolved[0] ? pointValue : 0
}
