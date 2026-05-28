import { describe, expect, it } from 'vitest'
import {
  MATCH_SCORING_TIERS,
  OUTRIGHT_SCORING_MARKETS,
  OUTRIGHT_SCORING_TOTAL_POINTS,
  RANKING_TIEBREAKERS,
  SCORING_REFERENCE_ROUTE,
  THEORETICAL_MATCH_POINTS,
  THEORETICAL_MAX_POINTS,
} from '../../src/lib/scoring-reference'

describe('scoring reference data', () => {
  it('uses the live five-tier match scoring model', () => {
    expect(MATCH_SCORING_TIERS.map((tier) => tier.points)).toEqual([25, 15, 10, 5, 0])
  })

  it('describes the seven active outright markets totaling 600 points', () => {
    expect(OUTRIGHT_SCORING_MARKETS).toHaveLength(7)
    expect(OUTRIGHT_SCORING_MARKETS.find((market) => market.code === 'CHAMPION')?.pointValue).toBe(120)
    expect(OUTRIGHT_SCORING_MARKETS.find((market) => market.code === 'FINALISTS')?.pointValue).toBe(90)
    expect(OUTRIGHT_SCORING_TOTAL_POINTS).toBe(600)
  })

  it('keeps the 3200-point ceiling and scoring route aligned with product copy', () => {
    expect(THEORETICAL_MATCH_POINTS).toBe(2600)
    expect(THEORETICAL_MAX_POINTS).toBe(3200)
    expect(SCORING_REFERENCE_ROUTE).toBe('/pontuacao')
  })

  it('lists tiebreakers in ranking order', () => {
    expect(RANKING_TIEBREAKERS).toEqual([
      'Total de pontos',
      'Mais placares exatos',
      'Mais acertos de vencedor + saldo',
    ])
  })
})
