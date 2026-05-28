import type { Match } from '../db/schema/matches.js'

export function shouldLockMatch(kickoffTime: Date, now: Date): boolean {
  const lockThreshold = new Date(now.getTime() + 15 * 60 * 1000)
  return kickoffTime <= lockThreshold
}

export function getEffectiveMatchStatus(
  status: Match['status'],
  kickoffTime: Date,
  now = new Date(),
): Match['status'] {
  if (status === 'SCHEDULED' && shouldLockMatch(kickoffTime, now)) {
    return 'LOCKED'
  }

  return status
}
