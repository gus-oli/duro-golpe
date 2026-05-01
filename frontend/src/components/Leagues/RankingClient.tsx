'use client'

import { useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { BadgeGrid } from '@/components/Badges/BadgeGrid'

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
        // ignore
      }
    },
  })

  if (ranking.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhum membro na liga ainda.</p>
  }

  return (
    <ol className="flex flex-col gap-2">
      {ranking.map((entry) => (
        <li
          key={entry.userId}
          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200"
        >
          <span
            className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0 ${
              entry.position === 1
                ? 'bg-yellow-400 text-yellow-900'
                : entry.position === 2
                  ? 'bg-gray-300 text-gray-700'
                  : entry.position === 3
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600'
            }`}
            aria-label={`${entry.position}º lugar`}
          >
            {entry.position}
          </span>

          {entry.avatarUrl ? (
            <img
              src={entry.avatarUrl}
              alt={entry.displayName}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
              {entry.displayName[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium">{entry.displayName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Exatos: {entry.exactScoreCount} · Venc+Saldo: {entry.winnerGoalDiffCount}
            </p>
            <div className="mt-1">
              <BadgeGrid badges={badgesMap[entry.userId] ?? []} />
            </div>
          </div>

          <p className="font-bold text-green-700 text-lg shrink-0">
            {entry.totalPoints} <span className="text-xs font-normal text-gray-500">pts</span>
          </p>
        </li>
      ))}
    </ol>
  )
}
