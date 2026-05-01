import { integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { outrightMarkets } from './outrights.js'
import { users } from './users.js'

export const outrightScores = pgTable(
  'outright_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => outrightMarkets.id, { onDelete: 'cascade' }),
    points: integer('points').notNull(),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('outright_scores_user_market_unique').on(t.userId, t.marketId)],
)

export type OutrightScore = typeof outrightScores.$inferSelect
