import type { Match } from '../db/schema/matches.js'

export const MATCH_PREDICTION_LOCK_BEFORE_MS = 15 * 60 * 1000

export function getMatchPredictionLockDeadline(kickoffTime: Date): Date {
  return new Date(kickoffTime.getTime() - MATCH_PREDICTION_LOCK_BEFORE_MS)
}

export function getLockableKickoffThreshold(now: Date): Date {
  return new Date(now.getTime() + MATCH_PREDICTION_LOCK_BEFORE_MS)
}

export function shouldLockMatch(kickoffTime: Date, now: Date): boolean {
  return now >= getMatchPredictionLockDeadline(kickoffTime)
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
