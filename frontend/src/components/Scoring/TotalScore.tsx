'use client'

import { useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

const MAX_POINTS = 3200

interface TotalScoreProps {
  initialTotalPoints: number
  initialExactScoreCount: number
  initialWinnerGoalDiffCount: number
  token: string | null
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
  token,
}: TotalScoreProps) {
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints)
  const [exactScoreCount, setExactScoreCount] = useState(initialExactScoreCount)
  const [winnerGoalDiffCount, setWinnerGoalDiffCount] = useState(initialWinnerGoalDiffCount)

  useWebSocket(token, {
    'score:total:updated': (data) => {
      const event = data as ScoreTotalUpdatedEvent
      setTotalPoints(event.totalPoints)
      setExactScoreCount(event.exactScoreCount)
      setWinnerGoalDiffCount(event.winnerGoalDiffCount)
    },
  })

  const progressPercent = Math.min(Math.round((totalPoints / MAX_POINTS) * 1000) / 10, 100)

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-bold text-green-700" aria-live="polite">
          {totalPoints}
        </span>
        <span className="text-sm text-gray-500 mb-1">/ {MAX_POINTS} pts possíveis</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-3" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
        <span>
          Placar exato: <strong className="text-gray-700">{exactScoreCount}</strong>
        </span>
        <span>
          Vencedor+Saldo: <strong className="text-gray-700">{winnerGoalDiffCount}</strong>
        </span>
      </div>
    </div>
  )
}
