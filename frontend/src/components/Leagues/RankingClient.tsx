'use client'

import { useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { BadgeGrid } from '@/components/Badges/BadgeGrid'
import { EmptyState } from '@/components/ui/Primitives'

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

interface RankingClientProps {
  leagueId: string
  initialRanking: RankingEntry[]
  badgesMap: Record<string, Badge[]>
  token: string | null
}

interface RankingUpdatedEvent {
  type: 'ranking:updated'
  leagueId: string
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

function podiumClass(position: number) {
  if (position === 1) return 'bg-[var(--gold)] text-[#4a3100]'
  if (position === 2) return 'bg-[var(--sky)] text-[#0c344b]'
  if (position === 3) return 'bg-[var(--coral)] text-white'
  return 'bg-[rgba(18,33,58,0.08)] text-[var(--muted)]'
}

export function RankingClient({ leagueId, initialRanking, badgesMap, token }: RankingClientProps) {
  const [ranking, setRanking] = useState(initialRanking)

  useWebSocket(token, {
    'ranking:updated': async (data) => {
      const event = data as RankingUpdatedEvent
      if (event.leagueId !== leagueId) return
      try {
        const res = await fetch(`${API}/api/v1/leagues/${leagueId}/ranking`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) return
        const result = (await res.json()) as { ranking: RankingEntry[] }
        setRanking(result.ranking)
      } catch {
        // Ranking updates are opportunistic; the next page load will refresh.
      }
    },
  })

  if (ranking.length === 0) {
    return <EmptyState title="A liga ainda esta vazia" description="Convide a galera e deixe a tabela pegar fogo." />
  }

  return (
    <ol className="grid gap-3">
      {ranking.map((entry) => (
        <li key={entry.userId} className="dg-card p-4">
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
              <p className="truncate text-base font-black text-[var(--ink)]">{entry.displayName}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                Exatos {entry.exactScoreCount} / Saldo {entry.winnerGoalDiffCount}
              </p>
            </div>

            <p className="shrink-0 text-right font-[var(--font-display)] text-2xl font-black text-[var(--pitch-dark)]">
              {entry.totalPoints}
              <span className="ml-1 text-xs text-[var(--muted)]">pts</span>
            </p>
          </div>

          <div className="mt-3 border-t border-[var(--line)] pt-3">
            <BadgeGrid badges={badgesMap[entry.userId] ?? []} />
          </div>
        </li>
      ))}
    </ol>
  )
}
