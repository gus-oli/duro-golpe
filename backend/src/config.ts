import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

function loadDotEnvFile(): void {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const envPath = resolve(currentDir, '../.env')

  if (!existsSync(envPath)) {
    return
  }

  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadDotEnvFile()

const optionalNonEmptyString = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim().length === 0) {
      return undefined
    }

    return value
  },
  z.string().min(1).optional(),
)

const optionalBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
    if (normalized.length === 0) return undefined
  }

  return value
}, z.boolean().optional())

const optionalDate = z.preprocess((value) => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length === 0) return undefined
    return new Date(trimmed)
  }

  return value
}, z.date().optional())

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z.coerce.number().int().positive().max(60).default(5),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  API_FOOTBALL_KEY: optionalNonEmptyString,
  FOOTBALL_DATA_TOKEN: optionalNonEmptyString,
  FOOTBALL_DATA_POLL_ENABLED: optionalBoolean.default(false),
  FOOTBALL_DATA_POLL_START_AT: optionalDate,
  LOCK_SCHEDULERS_ENABLED: optionalBoolean.default(true),
  LOCK_SCHEDULERS_START_AT: optionalDate,
  FOOTBALL_DATA_COMPETITION_CODE: z.string().min(1).default('WC'),
  FOOTBALL_DATA_SEASON: z.coerce.number().int().default(2026),
  WEBHOOK_SECRET: z.string().min(16),
  BASE_URL: z.string().url().default('http://localhost:3001'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  BREVO_API_KEY: optionalNonEmptyString,
  BREVO_SENDER_EMAIL: optionalNonEmptyString,
  BREVO_SENDER_NAME: optionalNonEmptyString,
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  GOOGLE_CLIENT_ID: optionalNonEmptyString,
  GOOGLE_CLIENT_SECRET: optionalNonEmptyString,
  BIND_HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

function loadConfig(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${missing}`)
  }
  return result.data
}

export const config = loadConfig()
