import { describe, expect, it } from 'vitest'
import {
  OUTRIGHT_MARKET_CATALOG,
  OUTRIGHT_MARKET_CODES,
  OUTRIGHT_MARKET_TOTAL_POINTS,
} from '../../../src/outrights/catalog.js'

describe('launch outright catalog', () => {
  it('offers exactly the 8 active outright markets in display order', () => {
    expect(OUTRIGHT_MARKET_CATALOG.map((market) => market.code)).toEqual([
      OUTRIGHT_MARKET_CODES.CHAMPION,
      OUTRIGHT_MARKET_CODES.TOP_SCORER,
      OUTRIGHT_MARKET_CODES.GOLDEN_BALL,
      OUTRIGHT_MARKET_CODES.BEST_GOALKEEPER,
      OUTRIGHT_MARKET_CODES.FINALISTS,
      OUTRIGHT_MARKET_CODES.REVELATION,
      OUTRIGHT_MARKET_CODES.BEST_ATTACK,
      OUTRIGHT_MARKET_CODES.LAST_PLACE,
    ])
  })

  it('totals 670 outright points toward the 3270-point launch ceiling', () => {
    expect(OUTRIGHT_MARKET_TOTAL_POINTS).toBe(670)
    expect(OUTRIGHT_MARKET_CATALOG.reduce((sum, market) => sum + market.pointValue, 0)).toBe(670)
  })

  it('removes Zebra and renames Ataque+Positivo to Melhor Ataque', () => {
    expect(OUTRIGHT_MARKET_CATALOG.map((market) => market.name)).toContain('Melhor Ataque')
    expect(OUTRIGHT_MARKET_CATALOG.map((market) => market.name)).not.toContain('Ataque+Positivo')
    expect(OUTRIGHT_MARKET_CATALOG.map((market) => market.name)).not.toContain('Zebra')
  })

  it('requires exactly two selections for Finalistas and one for the other markets', () => {
    const finalists = OUTRIGHT_MARKET_CATALOG.find((market) => market.code === OUTRIGHT_MARKET_CODES.FINALISTS)
    expect(finalists).toMatchObject({
      name: 'Finalistas',
      pointValue: 90,
      selectionMin: 2,
      selectionMax: 2,
    })

    const nonFinalists = OUTRIGHT_MARKET_CATALOG.filter((market) => market.code !== OUTRIGHT_MARKET_CODES.FINALISTS)
    expect(nonFinalists.every((market) => market.selectionMin === 1 && market.selectionMax === 1)).toBe(true)
  })

  it('adds Melhor Goleiro as a single-selection player market', () => {
    expect(
      OUTRIGHT_MARKET_CATALOG.find((market) => market.code === OUTRIGHT_MARKET_CODES.BEST_GOALKEEPER),
    ).toMatchObject({
      name: 'Melhor Goleiro',
      pointValue: 70,
      selectionMin: 1,
      selectionMax: 1,
      optionType: 'PLAYER',
    })
  })
})
