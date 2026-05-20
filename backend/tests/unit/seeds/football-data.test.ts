import { describe, expect, it } from 'vitest'
import { formatFootballDataStage } from '../../../src/data-providers/football-data-formatting.js'

describe('formatFootballDataStage', () => {
  it('prefers group labeling when present', () => {
    expect(formatFootballDataStage('GROUP_STAGE', 'GROUP_A')).toBe('Grupo A')
    expect(formatFootballDataStage('GROUP_STAGE', 'GROUP_H')).toBe('Grupo H')
  })

  it('maps knockout stages into compact product labels', () => {
    expect(formatFootballDataStage('LAST_16', null)).toBe('Oitavas')
    expect(formatFootballDataStage('QUARTER_FINALS', null)).toBe('Quartas')
    expect(formatFootballDataStage('SEMI_FINALS', null)).toBe('Semifinais')
    expect(formatFootballDataStage('THIRD_PLACE', null)).toBe('Terceiro lugar')
    expect(formatFootballDataStage('FINAL', null)).toBe('Final')
  })

  it('falls back to a readable transformed stage when no explicit mapping exists', () => {
    expect(formatFootballDataStage('PLAYOFF_ROUND_1', null)).toBe('PLAYOFF ROUND 1')
  })
})
