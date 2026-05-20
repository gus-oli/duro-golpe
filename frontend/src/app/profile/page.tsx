import Link from 'next/link'
import { cookies } from 'next/headers'
import { PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'

interface League {
  id: string
  name: string
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
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { sub?: string; name?: string; displayName?: string }
    return decoded.sub ?? null
  } catch {
    return null
  }
}

function getDisplayNameFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { name?: string; displayName?: string; email?: string }
    return decoded.displayName ?? decoded.name ?? decoded.email ?? null
  } catch {
    return null
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

async function getMyLeagues(token: string): Promise<League[]> {
  try {
    const res = await fetch(`${API}/api/v1/leagues`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { leagues: League[] }
    return data.leagues
  } catch {
    return []
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const userId = getUserIdFromToken(token)
  const displayName = getDisplayNameFromToken(token) ?? 'Jogador'

  const [myTotal, leagues] = await Promise.all([
    userId ? getUserTotal(userId, token) : Promise.resolve(null),
    getMyLeagues(token),
  ])

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="dg-eyebrow">Conta</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--ink)] sm:text-4xl">{displayName}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Sua base de controle para voltar ao jogo, acompanhar desempenho e circular entre as superficies principais.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="open">{leagues.length} ligas</StatusPill>
              <StatusPill tone="resolved">{myTotal?.totalPoints ?? 0} pts totais</StatusPill>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/matches" className="dg-card-interactive block p-5">
            <p className="dg-eyebrow">Partidas</p>
            <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Voltar para agenda</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Abra jogos, envie palpites e acompanhe travas ao vivo.</p>
          </Link>
          <Link href="/leagues" className="dg-card-interactive block p-5">
            <p className="dg-eyebrow">Ligas</p>
            <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Ver minhas ligas</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ranking, badges e o codigo para puxar a galera.</p>
          </Link>
          <Link href="/outrights" className="dg-card-interactive block p-5">
            <p className="dg-eyebrow">Especiais</p>
            <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Abrir mercados</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Campeão, finalistas e outros mercados de longo prazo.</p>
          </Link>
        </section>

        {myTotal && (
          <section className="dg-surface p-5 sm:p-6">
            <SectionHeader eyebrow="Desempenho" title="Resumo de pontuação" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="dg-subtle-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Total</p>
                <p className="mt-2 text-3xl font-black text-[var(--ink)]">{myTotal.totalPoints}</p>
              </div>
              <div className="dg-subtle-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Exatos</p>
                <p className="mt-2 text-3xl font-black text-[var(--ink)]">{myTotal.exactScoreCount}</p>
              </div>
              <div className="dg-subtle-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Saldo/Vencedor</p>
                <p className="mt-2 text-3xl font-black text-[var(--ink)]">{myTotal.winnerGoalDiffCount}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </PageShell>
  )
}
