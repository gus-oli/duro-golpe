import '@fastify/jwt'
import 'fastify'
import fastifyOauth2 = require('@fastify/oauth2')

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; sv: number }
    user: { id: string }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: fastifyOauth2.OAuth2Namespace
  }
}

declare module 'node-cron' {
  interface ScheduledTask {
    start(): void
    stop(): void
    destroy(): void
  }

  interface ScheduleOptions {
    scheduled?: boolean
    timezone?: string
  }

  function schedule(
    expression: string,
    func: () => void | Promise<void>,
    options?: ScheduleOptions,
  ): ScheduledTask

  const cron: {
    schedule: typeof schedule
  }

  export = cron
}
