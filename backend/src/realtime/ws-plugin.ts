import type { FastifyInstance } from 'fastify'
import { assertActiveLeagueMember, matchExists } from '../auth/access-control.js'
import { getAuthTokenFromCookieHeader } from '../auth/cookies.js'
import { isSessionPayloadCurrent, type SessionPayload } from '../auth/session-lifecycle.js'
import { subscribeToMural } from '../mural/broadcaster.js'
import { subscribeToMatch } from './broadcaster.js'
import { registerUserSession } from './user-sessions.js'

export async function wsPlugin(app: FastifyInstance): Promise<void> {
  app.get(
    '/ws',
    { websocket: true },
    async (socket, request) => {
      const cookieToken = getAuthTokenFromCookieHeader(request.headers.cookie)
      if (!cookieToken) {
        socket.close(1008, 'Token required')
        return
      }

      let userId: string
      try {
        const payload = app.jwt.verify<SessionPayload>(cookieToken)
        if (!(await isSessionPayloadCurrent(payload))) {
          throw new Error('stale-session')
        }
        userId = payload.sub
      } catch {
        socket.close(1008, 'Unauthorized')
        return
      }

      registerUserSession(userId, socket)

      socket.on('message', (data: Buffer) => {
        void (async () => {
          try {
            const msg = JSON.parse(data.toString()) as { type: string; leagueId?: string; matchId?: string }

            if (msg.type === 'subscribe:mural' && msg.leagueId) {
              await assertActiveLeagueMember(userId, msg.leagueId)
              subscribeToMural(msg.leagueId, socket)
            }

            if (msg.type === 'subscribe:match' && msg.matchId) {
              if (!(await matchExists(msg.matchId))) {
                throw new Error('Match not found')
              }

              subscribeToMatch(msg.matchId, socket)
            }
          } catch {
            // Ignore malformed or unauthorized messages.
          }
        })()
      })
    },
  )
}
