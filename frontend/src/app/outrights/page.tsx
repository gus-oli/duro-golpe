import { cookies } from 'next/headers'
import { OutrightCard } from '@/components/OutrightCard/OutrightCard'
import { EmptyState, PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'

interface OutrightOption {
  id: string
  label: string
  teamId?: string | null
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

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getOutrights(token: string): Promise<OutrightMarket[]> {
  try {
    const res = await fetch(`${API}/api/v1/outrights`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { markets: OutrightMarket[] }
    return data.markets
  } catch {
    return []
  }
}

export default async function OutrightsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const markets = await getOutrights(token)

  const hasOpenMarkets = markets.some((market) => market.status === 'OPEN')
  const totalPoints = markets.reduce((sum, market) => sum + market.pointValue, 0)

  return (
    <PageShell>
      <div className="space-y-8">
        <section className="dg-surface-dark p-5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={hasOpenMarkets ? 'open' : 'locked'}>
                  {hasOpenMarkets ? 'Mercados abertos' : 'Mercados encerrados'}
                </StatusPill>
                <span className="dg-chip bg-white/10 text-white/72">{markets.length} mercados</span>
              </div>
              <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Apostas Especiais</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/76">
                Campeao, finalistas, artilharia e mercados que podem virar uma liga inteira.
              </p>
            </div>
            <div className="rounded-md bg-white/10 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/62">Em disputa</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black">{totalPoints} pts</p>
            </div>
          </div>
        </section>

        <SectionHeader
          eyebrow="Longo prazo"
          title="Mercados da Copa"
          description={
            hasOpenMarkets
              ? 'Disponiveis ate 1 hora antes da partida de abertura.'
              : 'Todas as apostas especiais estao encerradas.'
          }
        />

        {markets.length === 0 ? (
          <EmptyState title="Nenhum mercado disponivel" description="Quando os especiais forem carregados, eles aparecem aqui." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {markets.map((market) => (
              <OutrightCard key={market.id} {...market} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
