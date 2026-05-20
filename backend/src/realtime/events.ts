const LIVE_STATUS_CODES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'])
const FINISHED_STATUS_CODES = new Set(['FT', 'AET', 'PEN'])
const FOOTBALL_DATA_LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED'])
const FOOTBALL_DATA_FINISHED_STATUSES = new Set(['FINISHED'])
const FOOTBALL_DATA_SCHEDULED_STATUSES = new Set(['SCHEDULED', 'TIMED'])

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

export function mapFootballDataStatus(
  status: string | undefined,
): 'SCHEDULED' | 'LIVE' | 'FINISHED' | null {
  if (!status) {
    return null
  }

  if (FOOTBALL_DATA_SCHEDULED_STATUSES.has(status)) {
    return 'SCHEDULED'
  }

  if (FOOTBALL_DATA_LIVE_STATUSES.has(status)) {
    return 'LIVE'
  }

  if (FOOTBALL_DATA_FINISHED_STATUSES.has(status)) {
    return 'FINISHED'
  }

  return null
}
