import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify'

export const requireAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token invÃ¡lido ou expirado' })
  }
}
