import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TotalScore } from '@/components/Scoring/TotalScore'
import { RankingClient } from '@/components/Leagues/RankingClient'
import { PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'

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
    <PageShell>
      <div className="space-y-8">
        <Link href="/leagues" className="dg-button-secondary">
          Voltar para Minhas Ligas
        </Link>

        <section className="dg-surface-dark p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="open">Liga privada</StatusPill>
                <span className="dg-chip bg-white/10 text-white/72">
                  Codigo{' '}
                  <span
                    className="ml-1 font-mono"
                    data-smoke="league-invite-code"
                    data-invite-code={league.inviteCode}
                  >
                    {league.inviteCode}
                  </span>
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">{league.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/76">
                Ranking vivo, pontuacao total e conquistas da rodada no mesmo painel.
              </p>
            </div>
            <div className="rounded-md bg-white/10 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/62">Membros</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black">{ranking.length}</p>
            </div>
          </div>
        </section>

        {myTotal && token && (
          <section aria-label="Minha pontuacao" className="space-y-4">
            <SectionHeader eyebrow="Meu desempenho" title="Minha Pontuacao" />
            <TotalScore
              initialTotalPoints={myTotal.totalPoints}
              initialExactScoreCount={myTotal.exactScoreCount}
              initialWinnerGoalDiffCount={myTotal.winnerGoalDiffCount}
              token={token}
            />
          </section>
        )}

        <section aria-label="Classificacao" className="space-y-4">
          <SectionHeader
            eyebrow="Tabela"
            title="Classificacao"
            description="A disputa atualiza quando os resultados e especiais entram no placar."
          />
          <RankingClient leagueId={league.id} initialRanking={ranking} badgesMap={badgesMap} token={token || null} />
        </section>
      </div>
    </PageShell>
  )
}
