import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

type Params = { params: Promise<{ userId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  const { userId } = await params
  const search = request.nextUrl.search
  const res = await fetch(`${API}/api/v1/users/${userId}/scores/matches${search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}
