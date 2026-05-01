import { NextRequest, NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${API}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as { token?: string; message?: string }
  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? 'Nao foi possivel criar a conta' }, { status: res.status })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('auth_token', data.token!, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
