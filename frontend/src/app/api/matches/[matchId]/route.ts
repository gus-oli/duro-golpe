import { NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function GET(_request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params

  const res = await fetch(`${API}/api/v1/matches/${matchId}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ message: 'Não foi possível carregar a partida.' }, { status: res.status })
  }

  const data = (await res.json()) as unknown
  return NextResponse.json(data)
}
