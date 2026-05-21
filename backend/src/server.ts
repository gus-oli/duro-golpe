import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import websocket from '@fastify/websocket'
import { config } from './config.js'
import { authRoutes } from './auth/routes.js'
import { matchRoutes } from './matches/routes.js'
import { predictionRoutes } from './predictions/routes.js'
import { leagueRoutes } from './leagues/routes.js'
import { outrightRoutes } from './outrights/routes.js'
import { webhookRoutes } from './data-providers/webhook-handler.js'
import { wsPlugin } from './realtime/ws-plugin.js'
import { oauthRoutes } from './auth/oauth.js'
import { muralRoutes } from './mural/routes.js'
import { badgeRoutes } from './badges/routes.js'
import { scoringRoutes } from './scoring/routes.js'
import { accountRoutes } from './account/routes.js'

export async function buildServer(): Promise<ReturnType<typeof Fastify>> {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  })

  await app.register(cors, {
    origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : true,
    credentials: true,
  })

  await app.register(jwt, {
    secret: config.JWT_SECRET,
    formatUser: (payload) => ({ id: payload.sub }),
  })

  await app.register(websocket)

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)
    const typedError = error as { statusCode?: number; name?: string; message?: string }
    const statusCode = typedError.statusCode ?? 500
    return reply.status(statusCode).send({
      statusCode,
      error: typedError.name ?? 'Error',
      message: statusCode >= 500 ? 'Erro interno do servidor' : (typedError.message ?? 'Erro na requisição'),
    })
  })

  app.get('/health', async () => ({ ok: true }))

  await app.register(authRoutes)
  await app.register(oauthRoutes)
  await app.register(muralRoutes)
  await app.register(badgeRoutes)
  await app.register(scoringRoutes)
  await app.register(accountRoutes)
  await app.register(matchRoutes)
  await app.register(predictionRoutes)
  await app.register(leagueRoutes)
  await app.register(outrightRoutes)
  await app.register(webhookRoutes)
  await app.register(wsPlugin)

  return app
}
