import { integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { matches } from './matches.js'
import { users } from './users.js'

export const matchPredictions = pgTable(
  'match_predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id),
    predictedHome: integer('predicted_home').notNull(),
    predictedAway: integer('predicted_away').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.matchId)],
)

export type MatchPrediction = typeof matchPredictions.$inferSelect
export type NewMatchPrediction = typeof matchPredictions.$inferInsert
