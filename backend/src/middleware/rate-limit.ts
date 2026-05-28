import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import { createClient, type RedisClientType } from 'redis'
import { config } from '../config.js'

interface RateLimitOptions {
  key: string
  windowMs: number
  max: number
  extraBuckets?: (request: FastifyRequest) => string[]
}

const memoryStore = new Map<string, { count: number; expiresAt: number }>()
let redisClient: RedisClientType | null = null

async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({ url: config.REDIS_URL })
    redisClient.on('error', () => {
      // Keep request handling alive; rate limiting will fail closed via catch below.
    })
    await redisClient.connect()
  }

  return redisClient
}

async function incrementBucket(key: string, windowMs: number): Promise<number> {
  if (process.env['NODE_ENV'] === 'test') {
    const now = Date.now()
    const current = memoryStore.get(key)

    if (!current || current.expiresAt <= now) {
      memoryStore.set(key, { count: 1, expiresAt: now + windowMs })
      return 1
    }

    current.count += 1
    memoryStore.set(key, current)
    return current.count
  }

  const redis = await getRedisClient()
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.pExpire(key, windowMs)
  }
  return count
}

function buildDefaultBuckets(request: FastifyRequest, key: string): string[] {
  const buckets = [`ip:${request.ip}`]

  if (request.user?.id) {
    buckets.push(`user:${request.user.id}`)
  }

  return buckets.map((bucket) => `${key}:${bucket}`)
}

export function rateLimit(options: RateLimitOptions): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (process.env['NODE_ENV'] === 'test' && process.env['AUTH_RATE_LIMIT_ENFORCED'] !== 'true') {
      return
    }

    const extraBuckets = options.extraBuckets?.(request) ?? []
    const buckets = [
      ...buildDefaultBuckets(request, options.key),
      ...extraBuckets.map((bucket) => `${options.key}:${bucket}`),
    ]

    try {
      for (const bucket of buckets) {
        const count = await incrementBucket(bucket, options.windowMs)
        if (count > options.max) {
          return reply.status(429).send({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Muitas tentativas. Tente novamente em instantes.',
          })
        }
      }
    } catch {
      return reply.status(503).send({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Protecao temporariamente indisponivel. Tente novamente.',
      })
    }
  }
}

export function clearRateLimitMemoryStore(): void {
  memoryStore.clear()
}
