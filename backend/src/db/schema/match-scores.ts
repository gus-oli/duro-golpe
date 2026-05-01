import { boolean, index, integer, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { matches } from './matches.js'
import { matchPredictions } from './predictions.js'
import { matchResults } from './match-results.js'

export const matchScores = pgTable(
  'match_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id),
    predictionId: uuid('prediction_id')
      .notNull()
      .references(() => matchPredictions.id),
    matchResultId: uuid('match_result_id')
      .notNull()
      .references(() => matchResults.id),
    tier: varchar('tier', { length: 30 }).notNull(),
    points: integer('points').notNull(),
    isSuperseded: boolean('is_superseded').notNull().default(false),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('match_scores_prediction_result_unique').on(t.predictionId, t.matchResultId),
    index('match_scores_user_superseded_idx').on(t.userId, t.isSuperseded),
    index('match_scores_match_superseded_idx').on(t.matchId, t.isSuperseded),
  ],
)

export type MatchScore = typeof matchScores.$inferSelect
export type NewMatchScore = typeof matchScores.$inferInsert
