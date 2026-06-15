import { describe, it, expect } from 'vitest'
import {
  shouldAwardGolDeHonra,
  shouldAwardHatTrickExato,
  shouldAwardPrimeiraCravada,
  shouldAwardRegularidade,
  shouldAwardReiDoSaldo,
  shouldAwardVoltaPorCima,
} from '../../../src/badges/badge-rule-utils.js'

describe('Expanded scoring badge rules (pure logic)', () => {
  it('awards Primeira Cravada on the first exact score', () => {
    expect(shouldAwardPrimeiraCravada({ exactScoreCount: 1 })).toBe(true)
    expect(shouldAwardPrimeiraCravada({ exactScoreCount: 0 })).toBe(false)
  })

  it('awards Hat-trick de Cravadas at three exact scores', () => {
    expect(shouldAwardHatTrickExato({ exactScoreCount: 3 })).toBe(true)
    expect(shouldAwardHatTrickExato({ exactScoreCount: 2 })).toBe(false)
  })

  it('awards Rei do Saldo at five winner and goal-difference results', () => {
    expect(shouldAwardReiDoSaldo({ winnerGoalDiffCount: 5 })).toBe(true)
    expect(shouldAwardReiDoSaldo({ winnerGoalDiffCount: 4 })).toBe(false)
  })

  it('awards Gol de Honra when match points become positive', () => {
    expect(shouldAwardGolDeHonra({ matchPoints: 5 })).toBe(true)
    expect(shouldAwardGolDeHonra({ matchPoints: 0 })).toBe(false)
  })

  it('awards Regularidade at ten positive match scores', () => {
    expect(shouldAwardRegularidade({ positiveMatchScoreCount: 10 })).toBe(true)
    expect(shouldAwardRegularidade({ positiveMatchScoreCount: 9 })).toBe(false)
  })

  it('awards Volta por Cima on a correct result after three previous misses', () => {
    expect(shouldAwardVoltaPorCima({ tier: 'WINNER_OR_DRAW', previousConsecutiveIncorrect: 3 })).toBe(true)
    expect(shouldAwardVoltaPorCima({ tier: 'EXACT_SCORE', previousConsecutiveIncorrect: 4 })).toBe(true)
    expect(shouldAwardVoltaPorCima({ tier: 'TOTAL_MISS', previousConsecutiveIncorrect: 3 })).toBe(false)
    expect(shouldAwardVoltaPorCima({ tier: 'WINNER_OR_DRAW', previousConsecutiveIncorrect: 2 })).toBe(false)
  })
})
