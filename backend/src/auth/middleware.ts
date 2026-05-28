import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import { isSessionPayloadCurrent, type SessionPayload } from './session-lifecycle.js'

export const requireAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const payload = await request.jwtVerify<SessionPayload>()
    if (!(await isSessionPayloadCurrent(payload))) {
      throw new Error('stale-session')
    }
  } catch {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token invÃ¡lido ou expirado',
    })
  }
}
