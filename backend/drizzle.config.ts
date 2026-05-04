import type { Config } from 'drizzle-kit'

const migrationUrl =
  process.env['DATABASE_MIGRATION_URL'] ??
  process.env['DATABASE_URL'] ??
  'postgresql://duro_golpe:duro_golpe_dev@localhost:5432/duro_golpe'

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Hosted Neon setups commonly use a pooled runtime URL plus a direct migration URL.
    url: migrationUrl,
  },
} satisfies Config
