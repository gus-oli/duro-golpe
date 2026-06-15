import { describe, expect, it } from 'vitest'
import {
  formatSocialOddsPercentage,
  getOutcomeLabel,
  getSocialOddsMessage,
  shouldShowSocialOddsBars,
  type SocialOddsView,
} from '../../src/lib/social-odds'

function odds(overrides: Partial<SocialOddsView> = {}): SocialOddsView {
  return {
    status: 'AVAILABLE',
    source: 'FROZEN',
    totalPredictions: 10,
    minimumSample: 1,
    underdogThresholdBps: 3000,
    underdogThresholdPercentage: 30,
    capturedAt: '2026-06-15T12:00:00.000Z',
    outcomes: [
      { outcome: 'HOME_WIN', count: 7, basisPoints: 7000, percentage: 70 },
      { outcome: 'DRAW', count: 1, basisPoints: 1000, percentage: 10 },
      { outcome: 'AWAY_WIN', count: 2, basisPoints: 2000, percentage: 20 },
    ],
    ...overrides,
  }
}

describe('social odds UI helpers', () => {
  it('labels social outcomes using team labels and draw copy', () => {
    expect(getOutcomeLabel('HOME_WIN', { home: 'BRA', away: 'JPN' })).toBe('BRA')
    expect(getOutcomeLabel('DRAW', { home: 'BRA', away: 'JPN' })).toBe('Empate')
    expect(getOutcomeLabel('AWAY_WIN', { home: 'BRA', away: 'JPN' })).toBe('JPN')
  })

  it('formats integer and decimal percentages for pt-BR UI copy', () => {
    expect(formatSocialOddsPercentage(20)).toBe('20%')
    expect(formatSocialOddsPercentage(12.5)).toBe('12,5%')
  })

  it('distinguishes visible bars from unavailable and low-sample states', () => {
    expect(shouldShowSocialOddsBars(odds())).toBe(true)
    expect(getSocialOddsMessage(odds())).toBeNull()

    expect(shouldShowSocialOddsBars(odds({ status: 'LOW_SAMPLE', totalPredictions: 4 }))).toBe(false)
    expect(getSocialOddsMessage(odds({ status: 'LOW_SAMPLE', totalPredictions: 4 }))).toContain('Amostra baixa')

    expect(shouldShowSocialOddsBars(odds({ status: 'UNAVAILABLE', outcomes: [] }))).toBe(false)
    expect(getSocialOddsMessage(odds({ status: 'UNAVAILABLE', outcomes: [] }))).toBe('Consenso indisponível')
  })
})
