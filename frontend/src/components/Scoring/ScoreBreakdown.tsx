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
  token: string
}

const TIER_COLORS: Record<string, string> = {
  EXACT_SCORE: 'bg-green-100 text-green-800',
  WINNER_AND_GOAL_DIFF: 'bg-blue-100 text-blue-800',
  WINNER_OR_DRAW: 'bg-cyan-100 text-cyan-800',
  ONE_TEAM_GOALS: 'bg-yellow-100 text-yellow-700',
  TOTAL_MISS: 'bg-red-100 text-red-700',
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

export function ScoreBreakdown({ userId, matchId, token }: ScoreBreakdownProps) {
  const [score, setScore] = useState<MatchScoreItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`${API}/api/v1/users/${userId}/scores/matches?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = (await res.json()) as { items: MatchScoreItem[] }
        const item = data.items.find((s) => s.matchId === matchId)
        setScore(item ?? null)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    void fetchScore()
  }, [userId, matchId, token])

  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-2">Carregando pontuação...</p>
  }

  if (!score) {
    return <p className="text-sm text-gray-400 text-center py-2">Pontuação não disponível</p>
  }

  const colorClass = TIER_COLORS[score.tier] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">Sua Pontuação</h3>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Seu palpite</p>
          <p className="text-base font-mono font-bold">
            {score.prediction.home} × {score.prediction.away}
          </p>
        </div>

        <div className="text-gray-300 text-xl">→</div>

        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Resultado</p>
          <p className="text-base font-mono font-bold">
            {score.result.home} × {score.result.away}
          </p>
        </div>

        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {score.tierLabel}
        </span>

        <span className="ml-auto font-bold text-green-700 text-lg">
          +{score.points} <span className="text-xs font-normal text-gray-500">pts</span>
        </span>
      </div>
    </div>
  )
}
