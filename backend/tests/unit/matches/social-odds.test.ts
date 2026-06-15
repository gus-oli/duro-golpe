import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgres://user:pass@localhost:5432/test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['JWT_SECRET'] = 'x'.repeat(32)
  process.env['WEBHOOK_SECRET'] = 'x'.repeat(16)
  process.env['BASE_URL'] = 'http://localhost:3001'
  process.env['FRONTEND_URL'] = 'http://localhost:3000'
  process.env['NODE_ENV'] = 'test'
})

import {
  buildSocialOddsView,
  countPredictionOutcomes,
  getPredictionOutcome,
  isOutcomeSocialUnderdog,
} from '../../../src/matches/social-odds.js'

describe('social odds helpers', () => {
  it('maps score predictions into social outcome buckets', () => {
    expect(getPredictionOutcome({ predictedHome: 2, predictedAway: 1 })).toBe('HOME_WIN')
    expect(getPredictionOutcome({ predictedHome: 1, predictedAway: 1 })).toBe('DRAW')
    expect(getPredictionOutcome({ predictedHome: 0, predictedAway: 2 })).toBe('AWAY_WIN')
  })

  it('counts home win, draw, and away win predictions', () => {
    expect(
      countPredictionOutcomes([
        { predictedHome: 2, predictedAway: 1 },
        { predictedHome: 3, predictedAway: 0 },
        { predictedHome: 1, predictedAway: 1 },
        { predictedHome: 0, predictedAway: 0 },
        { predictedHome: 1, predictedAway: 2 },
      ]),
    ).toEqual({
      homeWinCount: 2,
      drawCount: 2,
      awayWinCount: 1,
      totalPredictions: 5,
    })
  })

  it('returns unavailable odds without misleading zero-percent shares', () => {
    const view = buildSocialOddsView({
      counts: { homeWinCount: 0, drawCount: 0, awayWinCount: 0, totalPredictions: 0 },
      source: 'CURRENT',
      capturedAt: null,
    })

    expect(view.status).toBe('UNAVAILABLE')
    expect(view.outcomes).toEqual([])
  })

  it('respects a custom minimum sample when one is provided', () => {
    const view = buildSocialOddsView({
      counts: { homeWinCount: 3, drawCount: 1, awayWinCount: 1, totalPredictions: 5 },
      source: 'CURRENT',
      capturedAt: null,
      minimumSample: 10,
    })

    expect(view.status).toBe('LOW_SAMPLE')
    expect(view.outcomes.map((item) => [item.outcome, item.count, item.percentage])).toEqual([
      ['HOME_WIN', 3, 60],
      ['DRAW', 1, 20],
      ['AWAY_WIN', 1, 20],
    ])
  })

  it('qualifies an underdog only when sample and threshold rules are met', () => {
    const view = buildSocialOddsView({
      counts: { homeWinCount: 6, drawCount: 1, awayWinCount: 3, totalPredictions: 10 },
      source: 'FROZEN',
      capturedAt: new Date('2026-06-15T12:00:00.000Z'),
      minimumSample: 10,
      underdogThresholdBps: 3000,
    })

    expect(view.status).toBe('AVAILABLE')
    expect(isOutcomeSocialUnderdog(view, 'HOME_WIN')).toBe(false)
    expect(isOutcomeSocialUnderdog(view, 'DRAW')).toBe(true)
    expect(isOutcomeSocialUnderdog(view, 'AWAY_WIN')).toBe(true)
  })

  it('uses any available prediction sample and the default 30 percent underdog threshold', () => {
    const availableView = buildSocialOddsView({
      counts: { homeWinCount: 4, drawCount: 1, awayWinCount: 0, totalPredictions: 5 },
      source: 'FROZEN',
      capturedAt: new Date('2026-06-15T12:00:00.000Z'),
    })
    const onePredictionView = buildSocialOddsView({
      counts: { homeWinCount: 1, drawCount: 0, awayWinCount: 0, totalPredictions: 1 },
      source: 'FROZEN',
      capturedAt: new Date('2026-06-15T12:00:00.000Z'),
    })

    expect(availableView.status).toBe('AVAILABLE')
    expect(onePredictionView.status).toBe('AVAILABLE')
    expect(isOutcomeSocialUnderdog(availableView, 'DRAW')).toBe(true)
    expect(isOutcomeSocialUnderdog(availableView, 'HOME_WIN')).toBe(false)
    expect(isOutcomeSocialUnderdog(availableView, 'AWAY_WIN')).toBe(false)
    expect(isOutcomeSocialUnderdog(onePredictionView, 'HOME_WIN')).toBe(false)
  })
})
