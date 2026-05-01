import { describe, it, expect } from 'vitest'
import { shouldLockMatch } from '../../../src/matches/lock-utils.js'

describe('shouldLockMatch', () => {
  const FIFTEEN_MIN = 15 * 60 * 1000

  it('returns false when match is more than 15 minutes away', () => {
    const kickoff = new Date(Date.now() + FIFTEEN_MIN + 1000)
    expect(shouldLockMatch(kickoff, new Date())).toBe(false)
  })

  it('returns true when match kickoff is exactly 15 minutes from now', () => {
    const now = new Date()
    const kickoff = new Date(now.getTime() + FIFTEEN_MIN)
    expect(shouldLockMatch(kickoff, now)).toBe(true)
  })

  it('returns true when match kickoff is less than 15 minutes away', () => {
    const kickoff = new Date(Date.now() + FIFTEEN_MIN - 1000)
    expect(shouldLockMatch(kickoff, new Date())).toBe(true)
  })

  it('returns true when match has already started (past kickoff)', () => {
    const kickoff = new Date(Date.now() - 1000)
    expect(shouldLockMatch(kickoff, new Date())).toBe(true)
  })

  it('returns false when match is exactly 16 minutes away', () => {
    const now = new Date()
    const kickoff = new Date(now.getTime() + 16 * 60 * 1000)
    expect(shouldLockMatch(kickoff, now)).toBe(false)
  })

  it('returns true at boundary: exactly 15min 0s', () => {
    const now = new Date('2026-06-15T20:45:00.000Z')
    const kickoff = new Date('2026-06-15T21:00:00.000Z')
    expect(shouldLockMatch(kickoff, now)).toBe(true)
  })

  it('returns false at boundary: 15min 1s before', () => {
    const now = new Date('2026-06-15T20:44:59.000Z')
    const kickoff = new Date('2026-06-15T21:00:00.000Z')
    expect(shouldLockMatch(kickoff, now)).toBe(false)
  })
})
