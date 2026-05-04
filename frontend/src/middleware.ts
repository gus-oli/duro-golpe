import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/matches', '/leagues', '/outrights', '/profile']
const VALID_FORWARDED_PROTOCOLS = new Set(['http', 'https'])

function getForwardedValue(value: string | null) {
  const firstValue = value?.split(',')[0]?.trim()
  return firstValue ? firstValue : null
}

function buildLoginRedirectUrl(request: NextRequest, fromPath: string) {
  const loginUrl = new URL(request.nextUrl.toString())
  const forwardedHost = getForwardedValue(request.headers.get('x-forwarded-host'))
  const forwardedProtocol = getForwardedValue(request.headers.get('x-forwarded-proto'))

  loginUrl.pathname = '/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('from', fromPath)

  if (forwardedHost) {
    loginUrl.host = forwardedHost
  }

  if (forwardedProtocol && VALID_FORWARDED_PROTOCOLS.has(forwardedProtocol)) {
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
