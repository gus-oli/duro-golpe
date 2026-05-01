export function shouldLockMatch(kickoffTime: Date, now: Date): boolean {
  const lockThreshold = new Date(now.getTime() + 15 * 60 * 1000)
  return kickoffTime <= lockThreshold
}
