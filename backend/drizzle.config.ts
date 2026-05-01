import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? 'postgresql://duro_golpe:duro_golpe_dev@localhost:5432/duro_golpe',
  },
} satisfies Config
