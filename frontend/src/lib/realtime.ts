const REALTIME_FLAG = process.env['NEXT_PUBLIC_REALTIME_ENABLED']

export function isRealtimeEnabled(): boolean {
  if (REALTIME_FLAG == null) {
    return true
  }

  return REALTIME_FLAG.toLowerCase() === 'true'
}
