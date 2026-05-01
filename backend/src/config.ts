import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  API_FOOTBALL_KEY: z.string().min(1),
  WEBHOOK_SECRET: z.string().min(16),
  BASE_URL: z.string().url().default('http://localhost:3001'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
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
