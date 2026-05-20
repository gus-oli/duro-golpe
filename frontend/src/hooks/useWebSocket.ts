'use client'

import { useEffect, useRef, useCallback } from 'react'

type EventHandler = (data: unknown) => void
type EventMap = Record<string, EventHandler>
type SubscriptionMessage = { type: string; leagueId?: string; matchId?: string }

interface UseWebSocketOptions {
  subscriptions?: SubscriptionMessage[]
}

const WS_URL = process.env['NEXT_PUBLIC_WS_URL'] ?? 'ws://localhost:3001'

export function useWebSocket(enabled: boolean, handlers: EventMap, options?: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const handlersRef = useRef(handlers)
  const subscriptionsRef = useRef(options?.subscriptions ?? [])
  const subscriptionKey = JSON.stringify(options?.subscriptions ?? [])
  handlersRef.current = handlers
  subscriptionsRef.current = options?.subscriptions ?? []

  function dispatchMessage(rawMessage: string) {
    try {
      const message = JSON.parse(rawMessage) as { type: string }
      const handler = handlersRef.current[message.type]
      if (handler) handler(message)
    } catch {
      // ignore malformed
    }
  }

  const connect = useCallback(() => {
    if (!enabled) return

    const ws = new WebSocket(`${WS_URL}/ws`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        dispatchMessage(event.data)
      }
    }

    ws.onopen = () => {
      retriesRef.current = 0
      for (const subscription of subscriptionsRef.current) {
        ws.send(JSON.stringify(subscription))
      }
    }

    ws.onclose = () => {
      if (retriesRef.current < 5) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000)
        retriesRef.current++
        setTimeout(connect, delay)
      }
    }
  }, [enabled])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  useEffect(() => {
    const ws = wsRef.current
    if (ws?.readyState !== WebSocket.OPEN) {
      return
    }

    for (const subscription of subscriptionsRef.current) {
      ws.send(JSON.stringify(subscription))
    }
  }, [subscriptionKey])

  useEffect(() => {
    function handleInjectedEvent(event: Event) {
      const customEvent = event as CustomEvent<string>
      if (typeof customEvent.detail === 'string') {
        dispatchMessage(customEvent.detail)
      }
    }

    window.addEventListener('ws:test:inject', handleInjectedEvent as EventListener)
    return () => {
      window.removeEventListener('ws:test:inject', handleInjectedEvent as EventListener)
    }
  }, [])

  return wsRef
}
