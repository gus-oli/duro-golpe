import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedMutation } from '@/lib/proxy-security'

const API = process.env['API_URL'] ?? 'http://localhost:3001'
type Params = { params: Promise<{ matchId: string }> }

async function proxyPredictionRequest(
  request: NextRequest,
  matchId: string,
  method: 'POST' | 'PUT',
) {
  const rejection = rejectUntrustedMutation(request)
  if (rejection) {
    return rejection
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  const body = (await request.json()) as unknown
  const res = await fetch(`${API}/api/v1/matches/${matchId}/predictions`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as unknown
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest, { params }: Params) {
  const { matchId } = await params
  return proxyPredictionRequest(request, matchId, 'POST')
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { matchId } = await params
  return proxyPredictionRequest(request, matchId, 'PUT')
}
