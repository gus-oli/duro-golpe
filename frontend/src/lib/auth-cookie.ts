const AUTH_COOKIE_SECURE = process.env['AUTH_COOKIE_SECURE']

export function shouldUseSecureAuthCookie() {
  if (AUTH_COOKIE_SECURE != null) {
    return AUTH_COOKIE_SECURE.toLowerCase() === 'true'
  }

  return process.env['NODE_ENV'] === 'production'
}
