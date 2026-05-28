'use client'

import { useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { THEORETICAL_MAX_POINTS } from '@/lib/scoring-reference'

interface TotalScoreProps {
  initialTotalPoints: number
  initialExactScoreCount: number
  initialWinnerGoalDiffCount: number
  realtimeEnabled: boolean
}

interface ScoreTotalUpdatedEvent {
  type: 'score:total:updated'
  totalPoints: number
  outrightPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
}

export function TotalScore({
  initialTotalPoints,
  initialExactScoreCount,
  initialWinnerGoalDiffCount,
  realtimeEnabled,
}: TotalScoreProps) {
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints)
  const [exactScoreCount, setExactScoreCount] = useState(initialExactScoreCount)
  const [winnerGoalDiffCount, setWinnerGoalDiffCount] = useState(initialWinnerGoalDiffCount)

  useWebSocket(realtimeEnabled, {
    'score:total:updated': (data) => {
      const event = data as ScoreTotalUpdatedEvent
      setTotalPoints(event.totalPoints)
      setExactScoreCount(event.exactScoreCount)
      setWinnerGoalDiffCount(event.winnerGoalDiffCount)
    },
  })

  const progressPercent = Math.min(Math.round((totalPoints / THEORETICAL_MAX_POINTS) * 1000) / 10, 100)

  return (
    <div className="dg-surface overflow-hidden">
      <div className="grid gap-5 p-5 sm:grid-cols-[1fr_1.2fr] sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Pontuação total</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-[var(--font-display)] text-5xl font-black leading-none text-[var(--pitch-dark)]" aria-live="polite">
              {totalPoints}
            </span>
            <span className="pb-1 text-sm font-bold text-[var(--muted)]">/ {THEORETICAL_MAX_POINTS} pts</span>
          </div>
        </div>

        <div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[rgba(18,33,58,0.1)]"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--pitch),var(--gold))] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <span className="rounded-md bg-[rgba(12,143,79,0.1)] px-3 py-2 font-bold text-[var(--pitch-dark)]">
              Exatos: {exactScoreCount}
            </span>
            <span className="rounded-md bg-[rgba(93,183,222,0.16)] px-3 py-2 font-bold text-[#164766]">
              Saldo: {winnerGoalDiffCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
