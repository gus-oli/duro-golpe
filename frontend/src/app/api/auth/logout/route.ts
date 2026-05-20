import { NextResponse } from 'next/server'
import { shouldUseSecureAuthCookie } from '@/lib/auth-cookie'

function clearAuthCookie(request: Request) {
  const referer = request.headers.get('referer')
  const redirectUrl = referer ? new URL('/', referer) : new URL('/', 'http://localhost:3000')
  const response = NextResponse.redirect(redirectUrl)

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: shouldUseSecureAuthCookie(),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}

export async function GET(request: Request) {
  return clearAuthCookie(request)
}

export async function POST(request: Request) {
  return clearAuthCookie(request)
}
