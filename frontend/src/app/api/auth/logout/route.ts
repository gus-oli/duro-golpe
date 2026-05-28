import { NextRequest, NextResponse } from 'next/server'
import { shouldUseSecureAuthCookie } from '@/lib/auth-cookie'
import { getSafeLogoutRedirectUrl, rejectUntrustedMutation } from '@/lib/proxy-security'

function clearAuthCookie(request: NextRequest) {
  const response = NextResponse.redirect(getSafeLogoutRedirectUrl(request))

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: shouldUseSecureAuthCookie(),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}

export async function GET() {
  return NextResponse.json({ message: 'Metodo nao permitido' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  const rejection = rejectUntrustedMutation(request)
  if (rejection) {
    return rejection
  }

  return clearAuthCookie(request)
}
