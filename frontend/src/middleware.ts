import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/matches', '/leagues', '/outrights', '/profile']
const VALID_FORWARDED_PROTOCOLS = new Set(['http', 'https'])
const SAFE_HOST_PATTERN = /^(?:\[[0-9a-fA-F:]+\]|[A-Za-z0-9.-]+)(?::\d+)?$/
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'])

function getForwardedValue(value: string | null) {
  const firstValue = value?.split(',')[0]?.trim()
  return firstValue ? firstValue : null
}

function isLoopbackHost(hostname: string) {
  return LOOPBACK_HOSTS.has(hostname)
}

function isSafeForwardedHost(host: string | null) {
  return Boolean(host && SAFE_HOST_PATTERN.test(host))
}

function buildLoginRedirectUrl(request: NextRequest, fromPath: string) {
  const loginUrl = new URL(request.nextUrl.toString())
  const forwardedHost = getForwardedValue(request.headers.get('x-forwarded-host'))
  const forwardedProtocol = getForwardedValue(request.headers.get('x-forwarded-proto'))
  const shouldTrustForwardedOrigin = isLoopbackHost(request.nextUrl.hostname)

  loginUrl.pathname = '/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('from', fromPath)

  if (shouldTrustForwardedOrigin && forwardedHost && isSafeForwardedHost(forwardedHost)) {
    loginUrl.host = forwardedHost
  }

  if (shouldTrustForwardedOrigin && forwardedProtocol && VALID_FORWARDED_PROTOCOLS.has(forwardedProtocol)) {
    loginUrl.protocol = `${forwardedProtocol}:`
  }

  return loginUrl
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  if (PROTECTED.some((path) => pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(buildLoginRedirectUrl(request, pathname))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
