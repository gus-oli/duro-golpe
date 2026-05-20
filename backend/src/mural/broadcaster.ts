import type { WebSocket } from 'ws'
import { createClient } from 'redis'
import { config } from '../config.js'

const muralSubscribers = new Map<string, Set<WebSocket>>()

export function subscribeToMural(leagueId: string, ws: WebSocket): void {
  const key = leagueId
  if (!muralSubscribers.has(key)) muralSubscribers.set(key, new Set())
  muralSubscribers.get(key)!.add(ws)

  ws.on('close', () => {
    muralSubscribers.get(key)?.delete(ws)
  })
}

function broadcastToMural(leagueId: string, payload: unknown): void {
  const subscribers = muralSubscribers.get(leagueId)
  if (!subscribers) return

  const message = JSON.stringify(payload)
  for (const ws of subscribers) {
    if (ws.readyState === ws.OPEN) ws.send(message)
  }
}

export async function startMuralSubscriber(): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  await subscriber.connect()

  await subscriber.pSubscribe('mural:*', (message, channel) => {
    try {
      const parts = channel.split(':')
      const leagueId = parts[1]
      if (!leagueId) return
      const payload = JSON.parse(message) as unknown
      broadcastToMural(leagueId, payload)
    } catch {
      // ignore malformed
    }
  })

  console.info('[MuralBroadcaster] Subscribed to Redis mural:* channels')
}
