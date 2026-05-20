'use client'

import { useEffect, useState } from 'react'
import { BadgeGrid } from '@/components/Badges/BadgeGrid'
import { EmptyState } from '@/components/ui/Primitives'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Badge {
  type: string
  labelPt: string
  descriptionPt: string
  iconKey: string
  zebraCount: number | null
}

interface RankingEntry {
  userId: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
  position: number
  badges: Badge[]
}

interface RankingClientProps {
  leagueId: string
  initialRanking: RankingEntry[]
  realtimeEnabled: boolean
}

interface RankingUpdatedEvent {
  type: 'ranking:updated'
  leagueId: string
}

function podiumClass(position: number) {
  if (position === 1) return 'bg-[var(--gold)] text-[#4a3100]'
  if (position === 2) return 'bg-[rgba(120,182,255,0.22)] text-[var(--accent-strong)]'
  if (position === 3) return 'bg-[rgba(255,93,99,0.16)] text-[#9e2430]'
  return 'bg-[var(--surface-muted)] text-[var(--muted)]'
}

export function RankingClient({ leagueId, initialRanking, realtimeEnabled }: RankingClientProps) {
  const [ranking, setRanking] = useState(initialRanking)

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | null = null
    let attempts = 0
    const maxAttempts = 8
    const refreshDelayMs = 15000

    async function refreshRanking() {
      try {
        const res = await fetch(`/api/leagues/${leagueId}/ranking`, { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const result = (await res.json()) as { ranking: RankingEntry[] }
        if (!cancelled) {
          setRanking(result.ranking)
        }
      } catch {
        // Realtime remains primary; fallback stays intentionally lightweight.
      }
    }

    function scheduleRefresh() {
      if (cancelled || document.visibilityState !== 'visible' || attempts >= maxAttempts) return
      timeoutId = window.setTimeout(async () => {
        timeoutId = null
        attempts += 1
        await refreshRanking()
        scheduleRefresh()
      }, refreshDelayMs)
    }

    function handleVisibilityOrFocus() {
      if (document.visibilityState !== 'visible') return
      void refreshRanking()
      if (timeoutId == null) {
        scheduleRefresh()
      }
    }

    scheduleRefresh()
    window.addEventListener('focus', handleVisibilityOrFocus)
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)

    return () => {
      cancelled = true
      if (timeoutId != null) {
        window.clearTimeout(timeoutId)
      }
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
    }
  }, [leagueId])

  useWebSocket(
    realtimeEnabled,
    {
      'ranking:updated': async (data) => {
        const event = data as RankingUpdatedEvent
        if (event.leagueId !== leagueId) return
        try {
          const res = await fetch(`/api/leagues/${leagueId}/ranking`, { cache: 'no-store' })
          if (!res.ok) return
          const result = (await res.json()) as { ranking: RankingEntry[] }
          setRanking(result.ranking)
        } catch {
          // Ranking updates are opportunistic; the next refresh will reconcile.
        }
      },
    },
  )

  if (ranking.length === 0) {
    return <EmptyState title="A liga ainda esta vazia" description="Convide a galera e deixe a tabela pegar fogo." />
  }

  return (
    <ol className="grid gap-3">
      {ranking.map((entry) => (
        <li
          key={entry.userId}
          className="dg-card p-4 md:p-5"
          data-smoke="ranking-entry"
          data-user-id={entry.userId}
          data-user-name={entry.displayName}
          data-total-points={entry.totalPoints}
        >
          <div className="flex items-center gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-[var(--font-display)] text-xl font-black ${podiumClass(entry.position)}`}
              aria-label={`${entry.position} lugar`}
            >
              {entry.position}
            </span>

            {entry.avatarUrl ? (
              <img
                src={entry.avatarUrl}
                alt={entry.displayName}
                className="h-12 w-12 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[rgba(12,143,79,0.13)] font-black text-[var(--pitch-dark)]">
                {entry.displayName[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black text-[var(--ink)]" data-smoke="ranking-name">
                {entry.displayName}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                Exatos {entry.exactScoreCount} / Saldo {entry.winnerGoalDiffCount}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p
                className="font-[var(--font-display)] text-2xl font-black text-[var(--accent-strong)]"
                data-smoke="ranking-points"
              >
                {entry.totalPoints}
                <span className="ml-1 text-xs text-[var(--muted)]">pts</span>
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                {entry.position <= 3 ? 'Podio' : `Top ${entry.position}`}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-[var(--line)] pt-3">
            <BadgeGrid badges={entry.badges ?? []} />
          </div>
        </li>
      ))}
    </ol>
  )
}
