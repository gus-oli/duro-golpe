'use client'

import { useEffect, useState } from 'react'

interface MatchScoreItem {
  matchId: string
  matchDate: string
  prediction: { home: number; away: number }
  result: { home: number; away: number }
  tier: string
  tierLabel: string
  points: number
}

interface ScoreBreakdownProps {
  userId: string
  matchId: string
}

const TIER_COLORS: Record<string, string> = {
  EXACT_SCORE: 'bg-[rgba(12,143,79,0.13)] text-[var(--pitch-dark)] border-[rgba(12,143,79,0.22)]',
  WINNER_AND_GOAL_DIFF: 'bg-[rgba(93,183,222,0.18)] text-[#164766] border-[rgba(93,183,222,0.34)]',
  WINNER_OR_DRAW: 'bg-[rgba(246,196,69,0.22)] text-[#7c4a00] border-[rgba(246,196,69,0.4)]',
  ONE_TEAM_GOALS: 'bg-[rgba(233,95,79,0.12)] text-[#913022] border-[rgba(233,95,79,0.24)]',
  TOTAL_MISS: 'bg-[rgba(18,33,58,0.08)] text-[var(--muted)] border-[rgba(18,33,58,0.12)]',
}

export function ScoreBreakdown({ userId, matchId }: ScoreBreakdownProps) {
  const [score, setScore] = useState<MatchScoreItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/users/${userId}/scores/matches?limit=50`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { items: MatchScoreItem[] }
        const item = data.items.find((s) => s.matchId === matchId)
        setScore(item ?? null)
      } catch {
        // Keep the page usable if the score detail endpoint is temporarily unavailable.
      } finally {
        setLoading(false)
      }
    }
    void fetchScore()
  }, [userId, matchId])

  if (loading) {
    return <p className="py-3 text-center text-sm font-medium text-[var(--muted)]">Carregando pontuacao...</p>
  }

  if (!score) {
    return <p className="py-3 text-center text-sm font-medium text-[var(--muted)]">Pontuacao indisponivel</p>
  }

  const colorClass = TIER_COLORS[score.tier] ?? 'bg-white text-[var(--muted)] border-[var(--line)]'

  return (
    <div className="dg-surface mt-4 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Palpite</p>
            <p className="mt-1 font-[var(--font-display)] text-2xl font-black">
              {score.prediction.home} x {score.prediction.away}
            </p>
          </div>
          <span className="text-lg font-black text-[var(--gold)]" aria-hidden>
            /
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Resultado</p>
            <p className="mt-1 font-[var(--font-display)] text-2xl font-black">
              {score.result.home} x {score.result.away}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
          <span className={`rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] ${colorClass}`}>
            {score.tierLabel}
          </span>
          <span className="font-[var(--font-display)] text-2xl font-black text-[var(--pitch-dark)]">
            +{score.points} <span className="text-sm text-[var(--muted)]">pts</span>
          </span>
        </div>
      </div>
    </div>
  )
}
