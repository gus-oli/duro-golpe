import { describe, expect, it } from 'vitest'
import { canDeleteLeague } from '../../src/lib/league-management'

describe('league owner management', () => {
  it('allows only the creator to delete a league', () => {
    const league = { createdBy: 'creator-1' }

    expect(canDeleteLeague('creator-1', league)).toBe(true)
    expect(canDeleteLeague('member-1', league)).toBe(false)
    expect(canDeleteLeague(null, league)).toBe(false)
  })
})
