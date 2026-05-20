import { describe, expect, it } from 'vitest'
import {
  filterSelectableOutrightTeams,
  isKnockoutPlaceholderTeam,
  isSmokeOnlyTeam,
} from '../../../src/outrights/team-options.js'

describe('outright team option filtering', () => {
  it('detects unresolved knockout placeholders', () => {
    expect(
      isKnockoutPlaceholderTeam({
        name: 'A definir R1603B',
        fifaCode: 'R1603B',
        apiFootballId: null,
      }),
    ).toBe(true)
  })

  it('detects smoke-only teams', () => {
    expect(
      isSmokeOnlyTeam({
        name: 'Brazil',
        fifaCode: 'XBR',
        apiFootballId: 'smoke-team-bra',
      }),
    ).toBe(true)
  })

  it('prefers real teams when they exist and excludes placeholders', () => {
    const filtered = filterSelectableOutrightTeams([
      { name: 'Brasil', fifaCode: 'BRA', apiFootballId: '1' },
      { name: 'Franca', fifaCode: 'FRA', apiFootballId: '2' },
      { name: 'Brazil', fifaCode: 'XBR', apiFootballId: 'smoke-team-bra' },
      { name: 'A definir R1603B', fifaCode: 'R1603B', apiFootballId: null },
    ])

    expect(filtered).toEqual([
      { name: 'Brasil', fifaCode: 'BRA', apiFootballId: '1' },
      { name: 'Franca', fifaCode: 'FRA', apiFootballId: '2' },
    ])
  })

  it('keeps smoke teams available when they are the only non-placeholder dataset', () => {
    const filtered = filterSelectableOutrightTeams([
      { name: 'Brazil', fifaCode: 'XBR', apiFootballId: 'smoke-team-bra' },
      { name: 'France', fifaCode: 'XFR', apiFootballId: 'smoke-team-fra' },
      { name: 'A definir SF01A', fifaCode: 'SF01A', apiFootballId: null },
    ])

    expect(filtered).toEqual([
      { name: 'Brazil', fifaCode: 'XBR', apiFootballId: 'smoke-team-bra' },
      { name: 'France', fifaCode: 'XFR', apiFootballId: 'smoke-team-fra' },
    ])
  })
})
