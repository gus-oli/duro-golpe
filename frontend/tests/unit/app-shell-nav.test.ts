import { describe, expect, it } from 'vitest'
import { AUTHENTICATED_NAV_ITEMS } from '../../src/components/ui/app-shell-nav'

describe('authenticated shell navigation', () => {
  it('exposes pontuacao as a first-class destination', () => {
    expect(AUTHENTICATED_NAV_ITEMS.map((item) => item.href)).toEqual([
      '/',
      '/matches',
      '/leagues',
      '/outrights',
      '/simulador',
      '/pontuacao',
      '/profile',
    ])
  })
})
