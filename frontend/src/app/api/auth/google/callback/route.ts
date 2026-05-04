import { NextRequest, NextResponse } from 'next/server'
import { shouldUseSecureAuthCookie } from '@/lib/auth-cookie'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
  }

  const response = NextResponse.redirect(new URL('/matches', req.url))
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: shouldUseSecureAuthCookie(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
