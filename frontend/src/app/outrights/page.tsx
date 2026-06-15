import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { OutrightCard } from '@/components/OutrightCard/OutrightCard'
import { EmptyState, PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'
import { OUTRIGHT_SCORING_TOTAL_POINTS, SCORING_REFERENCE_ROUTE } from '@/lib/scoring-reference'

interface OutrightOption {
  id: string
  label: string
  teamId?: string | null
  teamFlagUrl?: string | null
  playerPhotoUrl?: string | null
  teamLabel?: string | null
  sourceTier?: 'OFFICIAL' | 'PRELIMINARY' | 'LIKELY' | null
  isActive?: boolean
  isFeatured?: boolean
  sortOrder?: number
}

interface OutrightMarket {
  id: string
  code: string
  name: string
  description?: string | null
  pointValue: number
  status: 'OPEN' | 'LOCKED' | 'RESOLVED'
  selectionMin: number
  selectionMax: number
  optionType: 'TEAM' | 'PLAYER'
  options: OutrightOption[]
  userPrediction: { optionId: string } | null
  userSelections: string[]
}

interface League {
  id: string
  name: string
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getOutrights(token: string): Promise<{ markets: OutrightMarket[]; error: string | null; unauthorized: boolean }> {
  try {
    const res = await fetch(`${API}/api/v1/outrights`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const data = (await res.json()) as { markets?: OutrightMarket[]; message?: string }
    if (res.status === 401) {
      return { markets: [], error: data.message ?? 'Sessao expirada.', unauthorized: true }
    }

    if (!res.ok) {
      return { markets: [], error: data.message ?? 'Nao foi possivel carregar os mercados.', unauthorized: false }
    }

    return { markets: data.markets ?? [], error: null, unauthorized: false }
  } catch {
    return { markets: [], error: 'Nao foi possivel carregar os mercados.', unauthorized: false }
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

export default async function OutrightsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  if (!token) {
    redirect('/login?from=/outrights')
  }

  const [{ markets, error, unauthorized }, leagues] = await Promise.all([
    getOutrights(token),
    token ? getMyLeagues(token) : Promise.resolve([]),
  ])

  if (unauthorized) {
    redirect('/login?from=/outrights')
  }

  const hasOpenMarkets = markets.some((market) => market.status === 'OPEN')
  const totalPoints = markets.reduce((sum, market) => sum + market.pointValue, 0)
  const primaryLeagueId = leagues[0]?.id ?? null

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-panel p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={hasOpenMarkets ? 'open' : 'locked'}>
                  {hasOpenMarkets ? 'Mercados abertos' : 'Mercados encerrados'}
                </StatusPill>
                <span className="dg-chip">{markets.length} mercados</span>
              </div>
              <h1 className="mt-4 text-4xl font-black text-[var(--ink)] sm:text-5xl">Apostas Especiais</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Campeão, finalistas, artilharia e mercados que podem virar uma liga inteira.
              </p>
            </div>
            <div className="dg-subtle-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Em disputa</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{totalPoints} pts</p>
            </div>
          </div>
        </section>

        <SectionHeader
          eyebrow="Longo prazo"
          title="Mercados da Copa"
          description={
            hasOpenMarkets
              ? `Disponíveis até 1 hora antes da partida de abertura. Valem ${OUTRIGHT_SCORING_TOTAL_POINTS} pts no total.`
              : 'Todas as apostas especiais estao encerradas.'
          }
          actions={
            <Link href={SCORING_REFERENCE_ROUTE} className="dg-button-secondary">
              Ver regra da pontuação
            </Link>
          }
        />

        {error ? (
          <EmptyState title="Mercados indisponíveis" description={error} />
        ) : markets.length === 0 ? (
          <EmptyState title="Nenhum mercado disponível" description="Quando os especiais forem carregados, eles aparecem aqui." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {markets.map((market) => (
              <OutrightCard key={market.id} {...market} leagueId={primaryLeagueId} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
