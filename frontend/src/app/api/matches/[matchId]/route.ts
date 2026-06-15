import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function GET(_request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null

  const res = await fetch(`${API}/api/v1/matches/${matchId}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!res.ok) {
    return NextResponse.json({ message: 'Não foi possível carregar a partida.' }, { status: res.status })
  }

  const data = (await res.json()) as unknown
  return NextResponse.json(data)
}
