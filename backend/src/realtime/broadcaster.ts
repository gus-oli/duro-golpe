import type { WebSocket } from 'ws'
import { createClient } from 'redis'
import { config } from '../config.js'

type MatchSubscribers = Map<string, Set<WebSocket>>

const matchSubscribers: MatchSubscribers = new Map()

export function subscribeToMatch(matchId: string, ws: WebSocket): void {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set())
  }
  matchSubscribers.get(matchId)!.add(ws)

  ws.on('close', () => {
    matchSubscribers.get(matchId)?.delete(ws)
  })
}

export function broadcastToMatch(matchId: string, payload: unknown): void {
  const subscribers = matchSubscribers.get(matchId)
  if (!subscribers) return

  const message = JSON.stringify(payload)
  for (const ws of subscribers) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message)
    }
  }
}

export async function startRedisSubscriber(): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  await subscriber.connect()

  await subscriber.pSubscribe('match:*', (message, channel) => {
    try {
      const payload = JSON.parse(message) as { matchId: string }
      broadcastToMatch(payload.matchId, { ...payload, channel })
    } catch {
      // ignore malformed messages
    }
  })

  console.info('[Broadcaster] Subscribed to Redis match:* channels')
}
