import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leagueId: string; userId: string }> },
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Nao autenticado' }, { status: 401 })
  }

  const { leagueId, userId } = await params
  const res = await fetch(`${API}/api/v1/leagues/${leagueId}/users/${userId}/picks`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}
