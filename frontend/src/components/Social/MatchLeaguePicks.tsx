'use client'

import { useState } from 'react'
import { EmptyState, StatusPill } from '@/components/ui/Primitives'

interface LeagueOption {
  id: string
  name: string
}

interface MatchLeaguePicksProps {
  matchId: string
  leagues: LeagueOption[]
}

interface MatchPredictionRow {
  userId: string
  displayName: string
  avatarUrl: string | null
  prediction: { predictedHome: number; predictedAway: number } | null
}

export function MatchLeaguePicks({ matchId, leagues }: MatchLeaguePicksProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagues[0]?.id ?? '')
  const [rows, setRows] = useState<MatchPredictionRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedLeagueId, setLoadedLeagueId] = useState<string | null>(null)

  async function loadRows(leagueId: string) {
    if (!leagueId) return
    setSelectedLeagueId(leagueId)
    if (loadedLeagueId === leagueId) return

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leagues/${leagueId}/matches/${matchId}/predictions`, { cache: 'no-store' })
      const data = (await res.json()) as { predictions?: MatchPredictionRow[]; message?: string }
      if (!res.ok) {
        throw new Error(data.message ?? 'Nao foi possivel carregar os palpites da liga.')
      }
      setRows(data.predictions ?? [])
      setLoadedLeagueId(leagueId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar os palpites da liga.')
    } finally {
      setIsLoading(false)
    }
  }

  if (leagues.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Liga</p>
          <h2 className="text-2xl font-black text-[var(--ink)]">Palpites da galera</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedLeagueId}
            onChange={(event) => setSelectedLeagueId(event.target.value)}
            className="dg-input min-w-[220px]"
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
          <button type="button" className="dg-button-secondary" onClick={() => loadRows(selectedLeagueId)}>
            Ver picks
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm font-bold text-[var(--muted)]">Carregando palpites da liga...</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {!isLoading && !error && loadedLeagueId && rows.length === 0 && (
        <EmptyState title="Ninguem palpitou ainda" description="Quando os palpites aparecerem, a comparacao entra aqui." />
      )}

      {rows.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <article key={row.userId} className="dg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[var(--ink)]">{row.displayName}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Comparativo da liga</p>
                </div>
                <StatusPill tone={row.prediction ? 'open' : 'neutral'}>
                  {row.prediction ? `${row.prediction.predictedHome} - ${row.prediction.predictedAway}` : 'Sem palpite'}
                </StatusPill>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
