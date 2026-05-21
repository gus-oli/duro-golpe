import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { MuralFeed } from '@/components/Mural/MuralFeed'
import { TotalScore } from '@/components/Scoring/TotalScore'
import { RankingClient } from '@/components/Leagues/RankingClient'
import { PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'
import type { MuralPostItem } from '@/components/Mural/types'
import { isRealtimeEnabled } from '@/lib/realtime'

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
  badges: Array<{
    type: string
    labelPt: string
    descriptionPt: string
    iconKey: string
    zebraCount: number | null
  }>
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
    return data.leagues.find((league) => league.id === leagueId) ?? null
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

async function getUserTotal(userId: string, token: string): Promise<UserTotal | null> {
  try {
    const res = await fetch(`${API}/api/v1/users/${userId}/score`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<UserTotal>
  } catch {
    return null
  }
}

async function getLeagueFeed(leagueId: string, token: string): Promise<MuralPostItem[]> {
  try {
    const res = await fetch(`${API}/api/v1/leagues/${leagueId}/mural?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { posts: MuralPostItem[] }
    return data.posts
  } catch {
    return []
  }
}

export default async function LeagueDetailPage({ params }: { params: Promise<{ leagueId: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const userId = token ? getUserIdFromToken(token) : null
  const realtimeEnabled = Boolean(token) && isRealtimeEnabled()
  const { leagueId } = await params

  const [league, ranking, myTotal, posts] = await Promise.all([
    getLeague(leagueId, token),
    getRanking(leagueId, token),
    userId && token ? getUserTotal(userId, token) : Promise.resolve(null),
    token ? getLeagueFeed(leagueId, token) : Promise.resolve([]),
  ])

  if (!league) notFound()

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-panel p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="open">Liga privada</StatusPill>
                <span className="dg-chip">
                  Codigo <span className="ml-1 font-mono">{league.inviteCode}</span>
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-black text-[var(--ink)] sm:text-5xl">{league.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Ranking vivo, pontuacao total e conquistas da rodada no mesmo painel.
              </p>
            </div>
            <div className="dg-subtle-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Membros</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{ranking.length}</p>
            </div>
          </div>
        </section>

        {myTotal && token && (
          <section aria-label="Minha pontuacao" className="space-y-4">
            <SectionHeader eyebrow="Pontuacao" title="Minha Pontuacao" />
            <TotalScore
              initialTotalPoints={myTotal.totalPoints}
              initialExactScoreCount={myTotal.exactScoreCount}
              initialWinnerGoalDiffCount={myTotal.winnerGoalDiffCount}
              realtimeEnabled={realtimeEnabled}
            />
          </section>
        )}

        <section aria-label="Classificacao" className="space-y-4">
          <SectionHeader
            eyebrow="Tabela"
            title="Classificacao"
            description="A disputa atualiza quando os resultados e especiais entram no placar."
          />
          <RankingClient leagueId={league.id} initialRanking={ranking} realtimeEnabled={realtimeEnabled} />
        </section>

        {token && (
          <section id="social-feed" aria-label="Mural da liga" className="space-y-4">
            <SectionHeader
              eyebrow="Mural"
              title="Resenha da Liga"
              description="A conversa da liga agora vive num unico feed para segurar a zoeira, a virada e o caos da rodada no mesmo lugar."
            />
            <div className="dg-surface overflow-hidden">
              <MuralFeed
                leagueId={league.id}
                initialPosts={posts}
                currentUserId={userId ?? ''}
                realtimeEnabled={realtimeEnabled}
              />
            </div>
          </section>
        )}
      </div>
    </PageShell>
  )
}
