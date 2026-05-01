import { describe, expect, it } from 'vitest'
import { OUTRIGHT_MARKET_CODES } from '../../../src/outrights/catalog.js'
import { calculateOutrightPoints } from '../../../src/outrights/resolution.js'

describe('calculateOutrightPoints', () => {
  it('awards full points when a single-winner market matches the resolved option', () => {
    expect(
      calculateOutrightPoints({
        marketCode: OUTRIGHT_MARKET_CODES.CHAMPION,
        pointValue: 120,
        predictedOptionIds: ['BRA'],
        resolvedOptionIds: ['BRA'],
      }),
    ).toBe(120)
  })

  it('awards zero when a single-winner market prediction misses', () => {
    expect(
      calculateOutrightPoints({
        marketCode: OUTRIGHT_MARKET_CODES.TOP_SCORER,
        pointValue: 90,
        predictedOptionIds: ['player-a'],
        resolvedOptionIds: ['player-b'],
      }),
    ).toBe(0)
  })

  it('requires both finalists in any order for the Finalistas market', () => {
    expect(
      calculateOutrightPoints({
        marketCode: OUTRIGHT_MARKET_CODES.FINALISTS,
        pointValue: 90,
        predictedOptionIds: ['BRA', 'ARG'],
        resolvedOptionIds: ['ARG', 'BRA'],
      }),
    ).toBe(90)

    expect(
      calculateOutrightPoints({
        marketCode: OUTRIGHT_MARKET_CODES.FINALISTS,
        pointValue: 90,
        predictedOptionIds: ['BRA', 'FRA'],
        resolvedOptionIds: ['ARG', 'BRA'],
      }),
    ).toBe(0)
  })
})
