import { NextRequest, NextResponse } from 'next/server'
import { shouldUseSecureAuthCookie } from '@/lib/auth-cookie'
import { rejectUntrustedMutation } from '@/lib/proxy-security'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function POST(request: NextRequest) {
  const rejection = rejectUntrustedMutation(request)
  if (rejection) {
    return rejection
  }

  const body = await request.json()

  const res = await fetch(`${API}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as { token?: string; message?: string }
  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? 'Não foi possível criar a conta' }, { status: res.status })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('auth_token', data.token!, {
    httpOnly: true,
    secure: shouldUseSecureAuthCookie(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
