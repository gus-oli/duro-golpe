import { cookies } from 'next/headers'
import { OutrightCard } from '@/components/OutrightCard/OutrightCard'

export const revalidate = 3600

interface OutrightOption {
  id: string
  label: string
  teamId?: string | null
}

interface OutrightMarket {
  id: string
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
      next: { revalidate: 3600 },
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

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Apostas Especiais</h1>
      <p className="text-sm text-gray-500 mb-6">
        {hasOpenMarkets
          ? 'Disponiveis ate 1 hora antes da partida de abertura.'
          : 'Todas as apostas especiais estao encerradas.'}
      </p>

      {markets.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Nenhum mercado disponivel.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {markets.map((market) => (
            <OutrightCard key={market.id} {...market} />
          ))}
        </div>
      )}
    </main>
  )
}
