import { index, integer, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { matches } from './matches.js'

export const resultStatusEnum = pgEnum('result_status', [
  'PENDING',
  'CONFIRMED',
  'AMENDED',
  'CANCELLED',
])

export const matchResults = pgTable(
  'match_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id),
    homeScore: integer('home_score').notNull(),
    awayScore: integer('away_score').notNull(),
    status: resultStatusEnum('status').notNull().default('PENDING'),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    source: varchar('source', { length: 100 }).notNull().default('api-football-v3'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('match_results_match_id_idx').on(t.matchId),
    index('match_results_match_status_idx').on(t.matchId, t.status),
  ],
)

export type MatchResult = typeof matchResults.$inferSelect
export type NewMatchResult = typeof matchResults.$inferInsert
