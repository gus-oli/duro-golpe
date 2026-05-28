import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedMutation } from '@/lib/proxy-security'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function POST(request: NextRequest) {
  const rejection = rejectUntrustedMutation(request)
  if (rejection) {
    return rejection
  }

  const body = await request.json()

  const res = await fetch(`${API}/api/v1/auth/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as { message?: string }
  return NextResponse.json(data, { status: res.status })
}
