import { describe, expect, it } from 'vitest'
import { getOptionMedia } from '../../src/components/OutrightCard/option-media'

describe('outright option media', () => {
  it('prefers player photos when available', () => {
    expect(getOptionMedia({ label: 'Lionel Messi', playerPhotoUrl: 'https://img/messi.png', teamFlagUrl: 'https://img/arg.png' })).toEqual({
      kind: 'player-photo',
      src: 'https://img/messi.png',
      fallbackText: null,
    })
  })

  it('uses team flags when the option has no player photo', () => {
    expect(getOptionMedia({ label: 'Brasil', teamFlagUrl: 'https://img/bra.png' })).toEqual({
      kind: 'team-flag',
      src: 'https://img/bra.png',
      fallbackText: null,
    })
  })

  it('falls back to the option initial when no media exists', () => {
    expect(getOptionMedia({ label: 'Craque Misterioso' })).toEqual({
      kind: 'fallback',
      src: null,
      fallbackText: 'C',
    })
  })
})
