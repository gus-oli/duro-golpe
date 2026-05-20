import { config } from '../config.js'

const AUTH_COOKIE_NAME = 'auth_token'
const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7

function shouldUseSecureAuthCookie(): boolean {
  if (config.BASE_URL.startsWith('https://') || config.FRONTEND_URL.startsWith('https://')) {
    return true
  }

  return config.NODE_ENV === 'production'
}

export function getAuthTokenFromCookieHeader(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null
  }

  for (const cookie of cookieHeader.split(';')) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=')
    if (rawName !== AUTH_COOKIE_NAME) {
      continue
    }

    const rawValue = rawValueParts.join('=')
    return rawValue ? decodeURIComponent(rawValue) : null
  }

  return null
}

export function serializeAuthCookie(token: string): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${SEVEN_DAYS_IN_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ]

  if (shouldUseSecureAuthCookie()) {
    parts.push('Secure')
  }

  return parts.join('; ')
}
