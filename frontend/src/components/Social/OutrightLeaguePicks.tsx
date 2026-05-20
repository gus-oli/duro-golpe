'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/ui/Primitives'

interface PredictionRow {
  userId: string
  displayName: string
  avatarUrl: string | null
  submittedAt: string | null
  selections: Array<{
    optionId: string
    label: string
    teamFlagUrl: string | null
    playerPhotoUrl: string | null
  }>
}

export function OutrightLeaguePicks({
  leagueId,
  marketId,
  marketName,
}: {
  leagueId: string
  marketId: string
  marketName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rows, setRows] = useState<PredictionRow[]>([])
  const [error, setError] = useState<string | null>(null)

  async function openPanel() {
    setIsOpen((current) => !current)
    if (isOpen || rows.length > 0 || isLoading) return

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leagues/${leagueId}/outrights/${marketId}/predictions`, { cache: 'no-store' })
      const data = (await res.json()) as { predictions?: PredictionRow[]; message?: string }
      if (!res.ok) {
        throw new Error(data.message ?? 'Nao foi possivel carregar as escolhas da liga.')
      }
      setRows(data.predictions ?? [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar as escolhas da liga.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Liga</p>
          <p className="text-sm font-black text-[var(--ink)]">Ver escolhas em {marketName}</p>
        </div>
        <button type="button" className="dg-button-secondary px-4 py-2 text-xs" onClick={openPanel}>
          {isOpen ? 'Ocultar' : 'Ver picks'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {isLoading && <p className="text-sm font-bold text-[var(--muted)]">Carregando escolhas...</p>}
          {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
          {!isLoading && !error && rows.length === 0 && (
            <EmptyState title="Sem escolhas ainda" description="As escolhas da liga aparecem aqui assim que forem enviadas." />
          )}
          {rows.map((row) => (
            <article key={row.userId} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
              <p className="text-sm font-black text-[var(--ink)]">{row.displayName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {row.selections.length === 0 ? (
                  <span className="text-sm text-[var(--muted)]">Sem palpite</span>
                ) : (
                  row.selections.map((selection) => (
                    <span
                      key={selection.optionId}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--ink)]"
                    >
                      {selection.playerPhotoUrl ? (
                        <img src={selection.playerPhotoUrl} alt={selection.label} className="h-7 w-7 rounded-full object-cover" />
                      ) : selection.teamFlagUrl ? (
                        <img src={selection.teamFlagUrl} alt={selection.label} className="h-5 w-7 rounded-sm object-cover" />
                      ) : null}
                      {selection.label}
                    </span>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
