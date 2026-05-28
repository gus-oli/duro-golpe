import type { FastifyInstance } from 'fastify'

export interface JwtPayload {
  sub: string
  sv: number
  iat?: number
  exp?: number
}

let fastifyInstance: FastifyInstance

export function initJwtService(app: FastifyInstance): void {
  fastifyInstance = app
}

export function signToken(userId: string, sessionVersion: number): string {
  return fastifyInstance.jwt.sign({ sub: userId, sv: sessionVersion }, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return fastifyInstance.jwt.verify<JwtPayload>(token)
}
