import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rejectUntrustedMutation } from '@/lib/proxy-security'

const API = process.env['API_URL'] ?? 'http://localhost:3001'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ leagueId: string }> }) {
  const rejection = rejectUntrustedMutation(req)
  if (rejection) return rejection

  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return NextResponse.json({ message: 'Nao autenticado' }, { status: 401 })

  const { leagueId } = await params
  const res = await fetch(`${API}/api/v1/leagues/${leagueId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : {}
  return NextResponse.json(data, { status: res.status })
}
