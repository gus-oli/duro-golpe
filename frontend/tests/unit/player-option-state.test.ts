import { describe, expect, it } from 'vitest'
import {
  PLAYER_SEARCH_RESULT_LIMIT,
  getPlayerSourceTierLabel,
  getVisiblePlayerOptions,
  type PlayerOptionView,
} from '../../src/components/OutrightCard/player-option-state'

const baseOptions: PlayerOptionView[] = [
  { id: '1', label: 'Kylian Mbappe - Franca', teamLabel: 'Franca', sourceTier: 'OFFICIAL', isActive: true, isFeatured: true },
  { id: '2', label: 'Vinicius Junior - Brasil', teamLabel: 'Brasil', sourceTier: 'OFFICIAL', isActive: true, isFeatured: true },
  { id: '3', label: 'Harry Kane - Inglaterra', teamLabel: 'Inglaterra', sourceTier: 'LIKELY', isActive: true, isFeatured: true },
  { id: '4', label: 'Lautaro Martinez - Argentina', teamLabel: 'Argentina', sourceTier: 'LIKELY', isActive: true, isFeatured: true },
  { id: '5', label: 'Lamine Yamal - Espanha', teamLabel: 'Espanha', sourceTier: 'LIKELY', isActive: true, isFeatured: true },
  { id: '6', label: 'Endrick - Brasil', teamLabel: 'Brasil', sourceTier: 'OFFICIAL', isActive: true, isFeatured: false },
  { id: '7', label: 'Akram Afif - Catar', teamLabel: 'Catar', sourceTier: 'PRELIMINARY', isActive: true, isFeatured: false },
  { id: '8', label: 'Old Pick - Franca', teamLabel: 'Franca', sourceTier: 'OFFICIAL', isActive: false, isFeatured: false },
]

describe('player option state', () => {
  it('shows only featured options by default', () => {
    const view = getVisiblePlayerOptions(baseOptions, [], '')

    expect(view.options.map((option) => option.id)).toEqual(['1', '2', '3', '4', '5'])
    expect(view.capped).toBe(false)
  })

  it('pins a selected inactive option above the featured defaults', () => {
    const view = getVisiblePlayerOptions(baseOptions, ['8'], '')

    expect(view.options[0]?.id).toBe('8')
    expect(view.options.map((option) => option.id)).toContain('1')
  })

  it('filters by player or team search and caps long result sets', () => {
    const largeOptions: PlayerOptionView[] = Array.from({ length: PLAYER_SEARCH_RESULT_LIMIT + 3 }, (_, index) => ({
      id: `${index + 1}`,
      label: `Jogador ${index + 1} - Brasil`,
      teamLabel: 'Brasil',
      sourceTier: 'LIKELY',
      isActive: true,
      isFeatured: false,
    }))

    const view = getVisiblePlayerOptions(largeOptions, [], 'brasil')

    expect(view.options).toHaveLength(PLAYER_SEARCH_RESULT_LIMIT)
    expect(view.totalMatches).toBe(PLAYER_SEARCH_RESULT_LIMIT + 3)
    expect(view.capped).toBe(true)
  })

  it('returns localized labels for source tiers', () => {
    expect(getPlayerSourceTierLabel('OFFICIAL')).toBe('Oficial')
    expect(getPlayerSourceTierLabel('PRELIMINARY')).toBe('Pre-lista')
    expect(getPlayerSourceTierLabel('LIKELY')).toBe('Provavel')
  })
})
