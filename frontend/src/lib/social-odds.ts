export type SocialOddsOutcome = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN'
export type SocialOddsStatus = 'UNAVAILABLE' | 'LOW_SAMPLE' | 'AVAILABLE'
export type SocialOddsSource = 'CURRENT' | 'FROZEN'

export interface SocialOddsOutcomeShare {
  outcome: SocialOddsOutcome
  count: number
  basisPoints: number
  percentage: number
}

export interface SocialOddsView {
  status: SocialOddsStatus
  source: SocialOddsSource
  totalPredictions: number
  minimumSample: number
  underdogThresholdBps: number
  underdogThresholdPercentage: number
  capturedAt: string | null
  outcomes: SocialOddsOutcomeShare[]
}

export function getOutcomeLabel(outcome: SocialOddsOutcome, labels: { home: string; away: string }): string {
  if (outcome === 'HOME_WIN') return labels.home
  if (outcome === 'AWAY_WIN') return labels.away
  return 'Empate'
}

export function formatSocialOddsPercentage(value: number): string {
  if (Number.isInteger(value)) return `${value}%`
  return `${value.toFixed(1).replace('.', ',')}%`
}

export function getSocialOddsMessage(odds: SocialOddsView | null | undefined): string | null {
  if (!odds) return null
  if (odds.status === 'UNAVAILABLE') return 'Consenso indisponível'
  if (odds.status === 'LOW_SAMPLE') {
    return `Amostra baixa: ${odds.totalPredictions}/${odds.minimumSample} palpites`
  }
  return null
}

export function shouldShowSocialOddsBars(odds: SocialOddsView | null | undefined): odds is SocialOddsView {
  return Boolean(odds && odds.status === 'AVAILABLE' && odds.outcomes.length > 0)
}
