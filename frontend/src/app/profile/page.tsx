import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ProfileSettingsForm } from '@/components/Profile/ProfileSettingsForm'
import { EmptyState, PageShell, StatusPill } from '@/components/ui/Primitives'

interface AccountProfile {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}

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

async function getMyProfile(token: string): Promise<AccountProfile | null> {
  try {
    const res = await fetch(`${API}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { user: AccountProfile }
    return data.user
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
  const profile = await getMyProfile(token)

  if (!profile) {
    notFound()
  }

  const [myTotal, leagues] = await Promise.all([
    getUserTotal(profile.id, token),
    getMyLeagues(token),
  ])

  return (
    <PageShell narrow>
      <div className="space-y-6">
        <section className="dg-panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="dg-eyebrow">Conta</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--ink)] sm:text-4xl">{profile.displayName}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Ajuste seu apelido, e-mail e senha sem sair do fluxo do produto.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="open">{leagues.length} ligas</StatusPill>
              <StatusPill tone="resolved">{myTotal?.totalPoints ?? 0} pts totais</StatusPill>
            </div>
          </div>
        </section>

        {myTotal ? (
          <section className="dg-surface p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
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
        ) : (
          <EmptyState title="Resumo indisponível" description="Seu placar total volta a aparecer assim que o backend responder esse painel." />
        )}

        <ProfileSettingsForm initialProfile={profile} />
      </div>
    </PageShell>
  )
}
