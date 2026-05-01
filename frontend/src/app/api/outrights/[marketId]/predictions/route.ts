import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env['API_URL'] ?? 'http://localhost:3001'
type Params = { params: Promise<{ marketId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

  const { marketId } = await params
  const body = (await req.json()) as unknown
  const res = await fetch(`${API}/api/v1/outrights/${marketId}/predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}
