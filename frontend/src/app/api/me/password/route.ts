import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedMutation } from '@/lib/proxy-security'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function POST(request: NextRequest) {
  const rejection = rejectUntrustedMutation(request)
  if (rejection) {
    return rejection
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Nao autenticado' }, { status: 401 })
  }

  const body = (await request.json()) as unknown
  const res = await fetch(`${API}/api/v1/me/password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}
