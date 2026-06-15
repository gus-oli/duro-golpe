import { describe, expect, it } from 'vitest'
import { localizeTeamName } from '../../../src/seeds/team-localization.js'

describe('localizeTeamName', () => {
  it('returns Brazilian Portuguese names when a FIFA code mapping exists', () => {
    expect(localizeTeamName('BRA', 'Brazil')).toBe('Brasil')
    expect(localizeTeamName('FRA', 'France')).toBe('França')
    expect(localizeTeamName('GER', 'Germany')).toBe('Alemanha')
  })

  it('falls back to the provider name when there is no mapping', () => {
    expect(localizeTeamName('XXX', 'Mystery Team')).toBe('Mystery Team')
    expect(localizeTeamName(null, 'Mystery Team')).toBe('Mystery Team')
  })
})
