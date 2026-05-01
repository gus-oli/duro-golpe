import type { FastifyInstance } from 'fastify'

export interface JwtPayload {
  sub: string
  iat?: number
  exp?: number
}

let fastifyInstance: FastifyInstance

export function initJwtService(app: FastifyInstance): void {
  fastifyInstance = app
}

export function signToken(userId: string): string {
  return fastifyInstance.jwt.sign({ sub: userId }, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return fastifyInstance.jwt.verify<JwtPayload>(token)
}
