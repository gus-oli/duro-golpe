import type { WebSocket } from 'ws'
import { createClient } from 'redis'
import { config } from '../config.js'

type MuralKey = `${string}:${string}`
const muralSubscribers = new Map<MuralKey, Set<WebSocket>>()

export function subscribeToMural(leagueId: string, matchId: string, ws: WebSocket): void {
  const key: MuralKey = `${leagueId}:${matchId}`
  if (!muralSubscribers.has(key)) muralSubscribers.set(key, new Set())
  muralSubscribers.get(key)!.add(ws)

  ws.on('close', () => {
    muralSubscribers.get(key)?.delete(ws)
  })
}

function broadcastToMural(leagueId: string, matchId: string, payload: unknown): void {
  const key: MuralKey = `${leagueId}:${matchId}`
  const subscribers = muralSubscribers.get(key)
  if (!subscribers) return

  const message = JSON.stringify(payload)
  for (const ws of subscribers) {
    if (ws.readyState === ws.OPEN) ws.send(message)
  }
}

export async function startMuralSubscriber(): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  await subscriber.connect()

  await subscriber.pSubscribe('mural:*:*', (message, channel) => {
    try {
      const parts = channel.split(':')
      const leagueId = parts[1]
      const matchId = parts[2]
      if (!leagueId || !matchId) return
      const payload = JSON.parse(message) as unknown
      broadcastToMural(leagueId, matchId, payload)
    } catch {
      // ignore malformed
    }
  })

  console.info('[MuralBroadcaster] Subscribed to Redis mural:*:* channels')
}
