export function validateFinalistsPrediction(predicted: string[], actual: string[]): boolean {
  if (predicted.length !== 2 || actual.length !== 2) return false
  const predictedSet = new Set(predicted)
  return predictedSet.size === 2 && actual.every((team) => predictedSet.has(team))
}

export function normalizeOutrightOptionIds(optionIds: string[]): string[] {
  return [...new Set(optionIds)]
}

export function validateSelectionCardinality(
  optionIds: string[],
  selectionMin: number,
  selectionMax: number,
): boolean {
  if (optionIds.length !== normalizeOutrightOptionIds(optionIds).length) {
    return false
  }

  return optionIds.length >= selectionMin && optionIds.length <= selectionMax
}
