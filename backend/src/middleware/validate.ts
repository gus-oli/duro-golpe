import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify'
import { ZodSchema, ZodError } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados inválidos',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }
    request.body = result.data
  }
}

export function validateQuery<T>(schema: ZodSchema<T>): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(request.query)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Parâmetros inválidos',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }
    request.query = result.data as Record<string, unknown>
  }
}
