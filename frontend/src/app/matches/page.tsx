import Link from 'next/link'
import { cookies } from 'next/headers'
import { MatchesWorkbench } from '@/components/MatchCard/MatchesWorkbench'
import { EmptyState, PageShell } from '@/components/ui/Primitives'
import type { SocialOddsView } from '@/lib/social-odds'

interface Match {
  id: string
  kickoffTime: string
  stage: string
  venue?: string | null
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeScore?: number | null
  awayScore?: number | null
  homeTeam: { id: string; name: string; fifaCode: string; flagUrl?: string | null }
  awayTeam: { id: string; name: string; fifaCode: string; flagUrl?: string | null }
  userPrediction?: { predictedHome: number; predictedAway: number } | null
  socialOdds?: SocialOddsView | null
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getMatches(token?: string | null): Promise<Match[]> {
  try {
    const res = await fetch(`${API}/api/v1/matches`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!res.ok) return []
    const data = (await res.json()) as { matches: Match[] }
    return data.matches
  } catch {
    return []
  }
}

export default async function MatchesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null
  const matches = await getMatches(token)

  return (
    <PageShell>
      {matches.length === 0 ? (
        <EmptyState
          title="Nenhuma partida disponível"
          description="Quando o calendário estiver carregado, os jogos aparecem aqui com status, contexto e área de trabalho."
          action={
            <Link href="/" className="dg-button-secondary">
              Voltar para home
            </Link>
          }
        />
      ) : (
        <MatchesWorkbench initialMatches={matches} isAuthenticated={Boolean(token)} />
      )}
    </PageShell>
  )
}
