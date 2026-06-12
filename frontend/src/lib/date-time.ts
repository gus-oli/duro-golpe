export const APP_TIME_ZONE = 'Etc/GMT+3'
export const APP_TIME_ZONE_LABEL = 'UTC-3'

const APP_LOCALE = 'pt-BR'

type DateInput = Date | number | string

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value)
}

function withAppTimeZone(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
  // IANA inverts the sign for fixed Etc/GMT zones; Etc/GMT+3 means UTC-3.
  return { ...options, timeZone: APP_TIME_ZONE }
}

export function formatAppDate(value: DateInput, options: Intl.DateTimeFormatOptions = {}): string {
  return toDate(value).toLocaleDateString(APP_LOCALE, withAppTimeZone(options))
}

export function formatAppDateTime(value: DateInput, options: Intl.DateTimeFormatOptions = {}): string {
  return toDate(value).toLocaleString(APP_LOCALE, withAppTimeZone(options))
}

export function formatAppTime(value: DateInput, options: Intl.DateTimeFormatOptions = {}): string {
  return toDate(value).toLocaleTimeString(APP_LOCALE, withAppTimeZone(options))
}

export function getAppDateKey(value: DateInput): string {
  return formatAppDate(value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
