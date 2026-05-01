'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useWebSocket } from '@/hooks/useWebSocket'
import { BadgeToast } from './BadgeToast'

interface BadgePayload {
  type: string
  labelPt: string
  descriptionPt: string
  iconKey: string
  awardedAt: string
}

interface BadgeAwardedEvent {
  type: 'badge:awarded'
  badge: BadgePayload
}

interface BadgeToastProviderProps {
  token: string | null
  children: React.ReactNode
}

export function BadgeToastProvider({ token, children }: BadgeToastProviderProps) {
  const [queue, setQueue] = useState<BadgePayload[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleDismiss = useCallback((idx: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  useWebSocket(token, {
    'badge:awarded': (data) => {
      const event = data as BadgeAwardedEvent
      setQueue((prev) => [...prev, event.badge])
    },
  })

  return (
    <>
      {children}
      {isMounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {queue.map((badge, idx) => (
              <BadgeToast key={`${badge.type}-${idx}`} badge={badge} onDismiss={() => handleDismiss(idx)} />
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
