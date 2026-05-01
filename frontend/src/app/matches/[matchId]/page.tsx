import { MatchDetailClient } from '@/components/MatchCard/MatchDetailClient'
import { ScoreBreakdown } from '@/components/Scoring/ScoreBreakdown'
import { PageShell, StatusPill } from '@/components/ui/Primitives'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

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
}

interface Prediction {
  predictedHome: number
  predictedAway: number
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const res = await fetch(`${API}/api/v1/matches/${matchId}`, { cache: 'no-store' })
    if (res.status === 404) return null
    return res.json() as Promise<Match>
  } catch {
    return null
  }
}

async function getUserPrediction(matchId: string, token: string): Promise<Prediction | null> {
  try {
    const res = await fetch(`${API}/api/v1/matches/${matchId}/predictions/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<Prediction>
  } catch {
    return null
  }
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { sub?: string }
    return decoded.sub ?? null
  } catch {
    return null
  }
}

function statusMeta(status: Match['status']) {
  if (status === 'LIVE') return { tone: 'live' as const, label: 'Ao vivo' }
  if (status === 'FINISHED') return { tone: 'resolved' as const, label: 'Final' }
  if (status === 'LOCKED') return { tone: 'locked' as const, label: 'Fechado' }
  return { tone: 'open' as const, label: 'Aberto' }
}

function TeamPanel({ team }: { team: Match['homeTeam'] }) {
  return (
    <div className="dg-surface p-4 text-center">
      {team.flagUrl && (
        <img src={team.flagUrl} alt={team.name} className="mx-auto h-16 w-24 rounded-md object-cover shadow-md" />
      )}
      <p className="mt-4 font-[var(--font-display)] text-4xl font-black leading-none text-[var(--ink)]">{team.fifaCode}</p>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{team.name}</p>
    </div>
  )
}

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null
  const userId = token ? getUserIdFromToken(token) : null
  const { matchId } = await params

  const [match, prediction] = await Promise.all([
    getMatch(matchId),
    token ? getUserPrediction(matchId, token) : Promise.resolve(null),
  ])

  if (!match) notFound()

  const kickoff = new Date(match.kickoffTime)
  const meta = statusMeta(match.status)

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-surface-dark overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                <span className="dg-chip bg-white/10 text-white/75">{match.stage}</span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                {match.homeTeam.name} x {match.awayTeam.name}
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-white/75">
                {kickoff.toLocaleString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {match.venue ? ` / ${match.venue}` : ''}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(160px,0.8fr)_minmax(320px,1.2fr)_minmax(160px,0.8fr)] lg:items-start">
          <TeamPanel team={match.homeTeam} />

          <div className="dg-surface overflow-hidden">
            <div className="border-b border-[var(--line)] bg-[rgba(255,253,244,0.78)] px-4 py-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Central do palpite</p>
            </div>
            <MatchDetailClient
              matchId={match.id}
              initialStatus={match.status}
              initialHome={match.homeScore}
              initialAway={match.awayScore}
              existingPrediction={prediction}
              token={token}
            />
          </div>

          <TeamPanel team={match.awayTeam} />
        </section>

        {token && userId && match.status === 'FINISHED' && (
          <section aria-label="Sua pontuacao">
            <ScoreBreakdown userId={userId} matchId={match.id} token={token} />
          </section>
        )}

        {match.status === 'LIVE' && (
          <div className="dg-surface px-5 py-4 text-center text-sm font-bold text-[var(--muted)]">
            Aguardando resultado final...
          </div>
        )}
      </div>
    </PageShell>
  )
}
