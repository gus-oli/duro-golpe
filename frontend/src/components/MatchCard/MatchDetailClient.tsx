'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { LiveScore } from '@/components/LiveScore/LiveScore'
import { PredictionInput } from './PredictionInput'
import { LockOverlay } from './LockOverlay'

interface Prediction {
  predictedHome: number
  predictedAway: number
}

interface MatchDetailClientProps {
  matchId: string
  initialStatus: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  initialHome?: number | null
  initialAway?: number | null
  existingPrediction: Prediction | null
  token: string | null
}

interface StatusChangedEvent {
  type: 'match:status:changed'
  matchId: string
  status: string
}

interface ScoreLiveEvent {
  type: 'match:score:live'
  matchId: string
  homeScore: number
  awayScore: number
}

export function MatchDetailClient({
  matchId,
  initialStatus,
  initialHome,
  initialAway,
  existingPrediction,
  token,
}: MatchDetailClientProps) {
  const [status, setStatus] = useState(initialStatus)
  const [prediction, setPrediction] = useState(existingPrediction)
  const [liveScore, setLiveScore] = useState({
    home: initialHome ?? null,
    away: initialAway ?? null,
  })
  const isLocked = status !== 'SCHEDULED'

  useEffect(() => {
    window.__TEST_MATCH_ID__ = matchId
  }, [matchId])

  async function handlePredictionSubmit(home: number, away: number): Promise<void> {
    const method = prediction ? 'PUT' : 'POST'
    const res = await fetch(`/api/matches/${matchId}/predictions`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        predictedHome: home,
        predictedAway: away,
      }),
    })

    const data = (await res.json()) as {
      message?: string
      predictedHome?: number
      predictedAway?: number
    }

    if (!res.ok) {
      throw new Error(data.message ?? 'Nao foi possivel salvar o palpite.')
    }

    setPrediction({
      predictedHome: data.predictedHome ?? home,
      predictedAway: data.predictedAway ?? away,
    })
  }

  useWebSocket(token, {
    'match:status:changed': (data) => {
      const event = data as StatusChangedEvent
      if (event.matchId === matchId) {
        setStatus(event.status as typeof initialStatus)
      }
    },
    'match:score:live': (data) => {
      const event = data as ScoreLiveEvent
      if (event.matchId === matchId) {
        setLiveScore({
          home: event.homeScore,
          away: event.awayScore,
        })
      }
    },
  }, {
    subscriptions: [{ type: 'subscribe:match', matchId }],
  })

  return (
    <>
      <div
        className="flex items-center justify-center"
        role="region"
        aria-label="Placar ao vivo"
      >
        <LiveScore home={liveScore.home} away={liveScore.away} />
      </div>

      <LockOverlay isLocked={isLocked} />

      {token ? (
        <PredictionInput
          matchId={matchId}
          existingPrediction={prediction}
          locked={isLocked}
          onSubmit={handlePredictionSubmit}
        />
      ) : (
        <div className="text-center py-6 px-4 border-t border-gray-100">
          <p className="text-gray-500 mb-3">Faça login para enviar seu palpite</p>
          <a
            href="/login"
            className="inline-block min-h-[48px] px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Entrar
          </a>
        </div>
      )}
    </>
  )
}
