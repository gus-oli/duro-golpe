import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function GET(_request: Request, { params }: { params: Promise<{ leagueId: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const { leagueId } = await params

  const res = await fetch(`${API}/api/v1/leagues/${leagueId}/ranking`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ message: 'Não foi possível carregar o ranking.' }, { status: res.status })
  }

  const data = (await res.json()) as unknown
  return NextResponse.json(data)
}
