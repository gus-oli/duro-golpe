import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import { isSessionPayloadCurrent, type SessionPayload } from './session-lifecycle.js'

export const requireAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  let reason = 'verify-failed'

  try {
    if (!request.headers.authorization) {
      reason = 'missing-authorization'
    }

    const payload = await request.jwtVerify<SessionPayload>()
    if (!(await isSessionPayloadCurrent(payload))) {
      reason = 'stale-session'
      throw new Error('stale-session')
    }
  } catch {
    request.log.info({ reason }, 'Authentication rejected')
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token invÃ¡lido ou expirado',
    })
  }
}
