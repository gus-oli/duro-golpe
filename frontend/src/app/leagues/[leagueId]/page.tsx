import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TotalScore } from '@/components/Scoring/TotalScore'
import { RankingClient } from '@/components/Leagues/RankingClient'

interface League {
  id: string
  name: string
  inviteCode: string
}

interface RankingEntry {
  userId: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
  position: number
}

interface Badge {
  type: string
  labelPt: string
  descriptionPt: string
  iconKey: string
  zebraCount: number | null
}

interface UserTotal {
  totalPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

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

async function getLeague(leagueId: string, token: string): Promise<League | null> {
  try {
    const res = await fetch(`${API}/api/v1/leagues`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { leagues: League[] }
    return data.leagues.find((l) => l.id === leagueId) ?? null
  } catch {
    return null
  }
}

async function getRanking(leagueId: string, token: string): Promise<RankingEntry[]> {
  try {
    const res = await fetch(`${API}/api/v1/leagues/${leagueId}/ranking`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { ranking: RankingEntry[] }
    return data.ranking
  } catch {
    return []
  }
}

async function getUserBadges(userId: string, token: string): Promise<Badge[]> {
  try {
    const res = await fetch(`${API}/api/v1/users/${userId}/badges`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { badges: Badge[] }
    return data.badges
  } catch {
    return []
  }
}

async function getUserTotal(userId: string, token: string): Promise<UserTotal> {
  try {
    const res = await fetch(`${API}/api/v1/users/${userId}/score`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return { totalPoints: 0, exactScoreCount: 0, winnerGoalDiffCount: 0 }
    return res.json() as Promise<UserTotal>
  } catch {
    return { totalPoints: 0, exactScoreCount: 0, winnerGoalDiffCount: 0 }
  }
}

export default async function LeagueDetailPage({ params }: { params: Promise<{ leagueId: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const userId = token ? getUserIdFromToken(token) : null
  const { leagueId } = await params

  const [league, ranking, myTotal] = await Promise.all([
    getLeague(leagueId, token),
    getRanking(leagueId, token),
    userId && token ? getUserTotal(userId, token) : Promise.resolve(null),
  ])

  if (!league) notFound()

  const badgesByUser = await Promise.all(
    ranking.map(async (entry) => ({ userId: entry.userId, badges: await getUserBadges(entry.userId, token) })),
  )
  const badgesMap = Object.fromEntries(badgesByUser.map(({ userId: uid, badges }) => [uid, badges]))

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/leagues" className="text-sm text-green-600 hover:underline mb-4 inline-block">
        ← Minhas Ligas
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{league.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Código de convite:{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{league.inviteCode}</span>
        </p>
      </div>

      {myTotal && token && (
        <section aria-label="Minha pontuação" className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Minha Pontuação</h2>
          <TotalScore
            initialTotalPoints={myTotal.totalPoints}
            initialExactScoreCount={myTotal.exactScoreCount}
            initialWinnerGoalDiffCount={myTotal.winnerGoalDiffCount}
            token={token}
          />
        </section>
      )}

      <section aria-label="Classificação">
        <h2 className="text-lg font-semibold mb-3">Classificação</h2>
        <RankingClient
          leagueId={league.id}
          initialRanking={ranking}
          badgesMap={badgesMap}
          token={token || null}
        />
      </section>
    </main>
  )
}
