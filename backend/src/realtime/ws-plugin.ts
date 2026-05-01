import type { FastifyInstance } from 'fastify'
import { subscribeToMatch } from './broadcaster.js'
import { registerUserSession } from './user-sessions.js'
import { subscribeToMural } from '../mural/broadcaster.js'

export async function wsPlugin(app: FastifyInstance): Promise<void> {
  // General authenticated WebSocket connection — receives all personal events
  // (badge:awarded, score:total:updated, score:match:updated, mural:post:new, ranking:updated)
  app.get(
    '/ws',
    { websocket: true },
    async (socket, request) => {
      const queryToken = (request.query as Record<string, string | undefined>)['token']
      if (!queryToken) {
        socket.close(1008, 'Token required')
        return
      }

      let userId: string
      try {
        const payload = app.jwt.verify<{ sub: string }>(queryToken)
        userId = payload.sub
      } catch {
        socket.close(1008, 'Unauthorized')
        return
      }

      registerUserSession(userId, socket)

      // Handle incoming subscription messages from the client
      socket.on('message', (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString()) as { type: string; leagueId?: string; matchId?: string }
          if (msg.type === 'subscribe:mural' && msg.leagueId && msg.matchId) {
            subscribeToMural(msg.leagueId, msg.matchId, socket)
          }
          if (msg.type === 'subscribe:match' && msg.matchId) {
            subscribeToMatch(msg.matchId, socket)
          }
        } catch {
          // ignore malformed messages
        }
      })
    },
  )

  // Match-specific WebSocket (legacy — kept for backward compatibility)
  app.get<{ Params: { matchId: string } }>(
    '/api/v1/ws/matches/:matchId',
    { websocket: true },
    (socket, request) => {
      const { matchId } = request.params
      subscribeToMatch(matchId, socket)
    },
  )
}
