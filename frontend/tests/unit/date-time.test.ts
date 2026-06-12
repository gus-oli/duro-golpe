import { describe, expect, it } from 'vitest'
import { APP_TIME_ZONE, formatAppDate, formatAppTime, getAppDateKey } from '../../src/lib/date-time'

describe('app date-time formatting', () => {
  it('formats display values in fixed UTC-3', () => {
    const value = '2026-06-15T01:30:00.000Z'

    expect(APP_TIME_ZONE).toBe('Etc/GMT+3')
    expect(getAppDateKey(value)).toBe('14/06/2026')
    expect(formatAppDate(value, { day: '2-digit', month: '2-digit', year: 'numeric' })).toBe('14/06/2026')
    expect(formatAppTime(value, { hour: '2-digit', minute: '2-digit' })).toBe('22:30')
  })
})
