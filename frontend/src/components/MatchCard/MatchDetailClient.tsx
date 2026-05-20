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
  isAuthenticated: boolean
  realtimeEnabled: boolean
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

interface MatchSnapshot {
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeScore?: number | null
  awayScore?: number | null
}

export function MatchDetailClient({
  matchId,
  initialStatus,
  initialHome,
  initialAway,
  existingPrediction,
  isAuthenticated,
  realtimeEnabled,
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

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | null = null
    let attempts = 0
    const maxAttempts = status === 'LIVE' ? 12 : 6
    const refreshDelayMs = status === 'LIVE' ? 10000 : status === 'LOCKED' ? 15000 : 5000

    async function refreshMatchState() {
      try {
        const res = await fetch(`/api/matches/${matchId}`, { cache: 'no-store' })
        if (!res.ok || cancelled) return

        const snapshot = (await res.json()) as MatchSnapshot
        if (cancelled) return

        setStatus(snapshot.status)
        setLiveScore({
          home: snapshot.homeScore ?? null,
          away: snapshot.awayScore ?? null,
        })
      } catch {
        // The WebSocket remains the primary transport; polling is a resilience fallback.
      }
    }

    function scheduleRefresh() {
      if (cancelled || document.visibilityState !== 'visible' || status === 'FINISHED' || attempts >= maxAttempts) {
        return
      }

      timeoutId = window.setTimeout(async () => {
        timeoutId = null
        attempts += 1
        await refreshMatchState()
        scheduleRefresh()
      }, refreshDelayMs)
    }

    function handleVisibilityOrFocus() {
      if (document.visibilityState !== 'visible' || status === 'FINISHED') return
      void refreshMatchState()
      if (timeoutId == null) {
        scheduleRefresh()
      }
    }

    void refreshMatchState()
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
  }, [matchId, status])

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
      throw new Error(data.message ?? 'Não foi possível salvar o palpite.')
    }

    setPrediction({
      predictedHome: data.predictedHome ?? home,
      predictedAway: data.predictedAway ?? away,
    })
  }

  useWebSocket(realtimeEnabled, {
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
      <div className="flex items-center justify-center px-4 py-6" role="region" aria-label="Placar ao vivo">
        <LiveScore home={liveScore.home} away={liveScore.away} />
      </div>

      <LockOverlay isLocked={isLocked} />

      {isAuthenticated ? (
        <PredictionInput
          matchId={matchId}
          existingPrediction={prediction}
          locked={isLocked}
          onSubmit={handlePredictionSubmit}
        />
      ) : (
        <div className="border-t border-[var(--line)] px-4 py-6 text-center">
          <p className="mb-3 text-sm font-bold text-[var(--muted)]">Faca login para enviar seu palpite</p>
          <a href="/login" className="dg-button-primary">
            Entrar
          </a>
        </div>
      )}
    </>
  )
}
