import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  const body = (await request.json()) as unknown
  const res = await fetch(`${API}/api/v1/predictions/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}
