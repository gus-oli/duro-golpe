import type { WebSocket } from 'ws'

const sessions = new Map<string, Set<WebSocket>>()

export function registerUserSession(userId: string, ws: WebSocket): void {
  if (!sessions.has(userId)) sessions.set(userId, new Set())
  sessions.get(userId)!.add(ws)

  ws.on('close', () => {
    sessions.get(userId)?.delete(ws)
    if (sessions.get(userId)?.size === 0) sessions.delete(userId)
  })
}

export function sendToUser(userId: string, payload: unknown): void {
  const userSessions = sessions.get(userId)
  if (!userSessions) return
  const message = JSON.stringify(payload)
  for (const ws of userSessions) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(message)
      } catch {
        // ignore closed/errored sockets
      }
    }
  }
}

export function getUserSessionCount(userId: string): number {
  return sessions.get(userId)?.size ?? 0
}
