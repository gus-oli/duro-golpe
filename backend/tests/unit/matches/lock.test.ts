import { describe, it, expect } from 'vitest'
import {
  getEffectiveMatchStatus,
  getLockableKickoffThreshold,
  getMatchPredictionLockDeadline,
  shouldLockMatch,
} from '../../../src/matches/lock-utils.js'

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

  it('locks 15 minutes before the UTC-3 displayed kickoff time', () => {
    const kickoff = new Date('2026-06-15T21:00:00.000Z') // 18:00 UTC-3
    const deadline = getMatchPredictionLockDeadline(kickoff)

    expect(deadline.toISOString()).toBe('2026-06-15T20:45:00.000Z') // 17:45 UTC-3
    expect(shouldLockMatch(kickoff, new Date('2026-06-15T20:44:59.999Z'))).toBe(false)
    expect(shouldLockMatch(kickoff, new Date('2026-06-15T20:45:00.000Z'))).toBe(true)
  })

  it('uses the same kickoff threshold for scheduler queries', () => {
    const now = new Date('2026-06-15T20:45:00.000Z')

    expect(getLockableKickoffThreshold(now).toISOString()).toBe('2026-06-15T21:00:00.000Z')
  })
})

describe('getEffectiveMatchStatus', () => {
  it('reports scheduled matches as locked inside the prediction lock window', () => {
    const now = new Date('2026-06-15T20:45:00.000Z')
    const kickoff = new Date('2026-06-15T21:00:00.000Z')

    expect(getEffectiveMatchStatus('SCHEDULED', kickoff, now)).toBe('LOCKED')
  })

  it('keeps future scheduled matches open', () => {
    const now = new Date('2026-06-15T20:44:59.000Z')
    const kickoff = new Date('2026-06-15T21:00:00.000Z')

    expect(getEffectiveMatchStatus('SCHEDULED', kickoff, now)).toBe('SCHEDULED')
  })

  it('does not rewrite non-scheduled lifecycle statuses', () => {
    const now = new Date('2026-06-15T20:45:00.000Z')
    const kickoff = new Date('2026-06-15T21:00:00.000Z')

    expect(getEffectiveMatchStatus('LIVE', kickoff, now)).toBe('LIVE')
  })
})
