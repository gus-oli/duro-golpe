const LIVE_STATUS_CODES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'])
const FINISHED_STATUS_CODES = new Set(['FT', 'AET', 'PEN'])

export function mapApiFootballStatus(
  statusShort: string | undefined,
): 'LIVE' | 'FINISHED' | null {
  if (!statusShort) {
    return null
  }

  if (LIVE_STATUS_CODES.has(statusShort)) {
    return 'LIVE'
  }

  if (FINISHED_STATUS_CODES.has(statusShort)) {
    return 'FINISHED'
  }

  return null
}
