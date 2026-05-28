import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedMutation } from '@/lib/proxy-security'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function forward(method: 'GET' | 'PATCH', body?: unknown) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Nao autenticado' }, { status: 401 })
  }

  const res = await fetch(`${API}/api/v1/me`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}

export async function GET() {
  return forward('GET')
}

export async function PATCH(request: NextRequest) {
  const rejection = rejectUntrustedMutation(request)
  if (rejection) {
    return rejection
  }

  const body = (await request.json()) as unknown
  return forward('PATCH', body)
}
