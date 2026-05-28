import { NextRequest, NextResponse } from 'next/server'
import { sanitizeRedirectPath } from './safe-redirect'

function getTrustedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin])
  const configuredOrigin = process.env['FRONTEND_URL']

  if (configuredOrigin) {
    try {
      origins.add(new URL(configuredOrigin).origin)
    } catch {
      // Ignore invalid configuration here and let request-origin checks fall back to request.nextUrl.origin.
    }
  }

  return origins
}

function extractOrigin(candidate: string | null): string | null {
  if (!candidate) {
    return null
  }

  try {
    return new URL(candidate).origin
  } catch {
    return null
  }
}

export function rejectUntrustedMutation(request: NextRequest): NextResponse | null {
  if (process.env['NODE_ENV'] !== 'production') {
    return null
  }

  const trustedOrigins = getTrustedOrigins(request)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  const requestOrigin = extractOrigin(origin)
  if (requestOrigin) {
    return trustedOrigins.has(requestOrigin)
      ? null
      : NextResponse.json({ message: 'Origem nao autorizada' }, { status: 403 })
  }

  const refererOrigin = extractOrigin(referer)
  if (refererOrigin) {
    return trustedOrigins.has(refererOrigin)
      ? null
      : NextResponse.json({ message: 'Origem nao autorizada' }, { status: 403 })
  }

  return NextResponse.json({ message: 'Origem nao autorizada' }, { status: 403 })
}

export function getSafeLogoutRedirectUrl(request: NextRequest): URL {
  return new URL('/', request.nextUrl.origin)
}

export function getSafeLoginRedirectTarget(candidate: string | null | undefined): string {
  return sanitizeRedirectPath(candidate, '/matches')
}
