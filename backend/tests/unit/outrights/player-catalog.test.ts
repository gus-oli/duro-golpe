import { describe, expect, it } from 'vitest'
import { OUTRIGHT_MARKET_CODES } from '../../../src/outrights/catalog.js'
import { PLAYER_MARKET_OPTIONS } from '../../../src/outrights/options-catalog.js'

describe('player outright catalog', () => {
  it('marks exactly five featured options per individual market', () => {
    for (const marketCode of [
      OUTRIGHT_MARKET_CODES.TOP_SCORER,
      OUTRIGHT_MARKET_CODES.GOLDEN_BALL,
      OUTRIGHT_MARKET_CODES.REVELATION,
    ]) {
      const options = PLAYER_MARKET_OPTIONS[marketCode] ?? []
      expect(options.filter((option) => option.isFeatured)).toHaveLength(5)
    }
  })

  it('ships a broader searchable catalog with source tiers and team labels', () => {
    for (const marketCode of [
      OUTRIGHT_MARKET_CODES.TOP_SCORER,
      OUTRIGHT_MARKET_CODES.GOLDEN_BALL,
      OUTRIGHT_MARKET_CODES.REVELATION,
    ]) {
      const options = PLAYER_MARKET_OPTIONS[marketCode] ?? []
      expect(options.length).toBeGreaterThanOrEqual(30)
      expect(options.every((option) => option.teamLabel && option.label.includes(' - '))).toBe(true)
      expect(options.some((option) => option.sourceTier === 'OFFICIAL')).toBe(true)
      expect(options.some((option) => option.sourceTier === 'PRELIMINARY')).toBe(true)
      expect(options.some((option) => option.sourceTier === 'LIKELY')).toBe(true)
    }
  })
})
