import { MatchDetailClient } from '@/components/MatchCard/MatchDetailClient'
import { ScoreBreakdown } from '@/components/Scoring/ScoreBreakdown'
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

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{match.stage}</p>
          <p className="text-sm text-gray-600 mt-1">
            {kickoff.toLocaleString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {match.venue && <p className="text-xs text-gray-400 mt-1">{match.venue}</p>}
        </div>

        <div className="flex items-center justify-between px-8 py-6">
          <div className="text-center">
            {match.homeTeam.flagUrl && (
              <img
                src={match.homeTeam.flagUrl}
                alt={match.homeTeam.name}
                className="w-16 h-10 object-cover mx-auto mb-2"
              />
            )}
            <p className="font-bold text-xl">{match.homeTeam.fifaCode}</p>
            <p className="text-sm text-gray-500">{match.homeTeam.name}</p>
          </div>

          <MatchDetailClient
            matchId={match.id}
            initialStatus={match.status}
            initialHome={match.homeScore}
            initialAway={match.awayScore}
            existingPrediction={prediction}
            token={token}
          />

          <div className="text-center">
            {match.awayTeam.flagUrl && (
              <img
                src={match.awayTeam.flagUrl}
                alt={match.awayTeam.name}
                className="w-16 h-10 object-cover mx-auto mb-2"
              />
            )}
            <p className="font-bold text-xl">{match.awayTeam.fifaCode}</p>
            <p className="text-sm text-gray-500">{match.awayTeam.name}</p>
          </div>
        </div>

        {token && userId && match.status === 'FINISHED' && (
          <div className="px-6 pb-5">
            <ScoreBreakdown userId={userId} matchId={match.id} token={token} />
          </div>
        )}

        {match.status === 'LIVE' && (
          <div className="px-6 pb-5 text-center text-sm text-gray-400">
            Aguardando resultado final...
          </div>
        )}
      </div>
    </main>
  )
}
