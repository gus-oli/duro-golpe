import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

type Params = { params: Promise<{ leagueId: string; matchId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

  const { leagueId, matchId } = await params
  const body = (await req.json()) as { content?: string }
  const res = await fetch(`${API}/api/v1/leagues/${leagueId}/mural`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      ...(body ?? {}),
      matchId,
    }),
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}
