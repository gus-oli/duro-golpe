import { integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { matches } from './matches.js'

export const matchSocialOddsSnapshots = pgTable(
  'match_social_odds_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    homeWinCount: integer('home_win_count').notNull().default(0),
    drawCount: integer('draw_count').notNull().default(0),
    awayWinCount: integer('away_win_count').notNull().default(0),
    totalPredictions: integer('total_predictions').notNull().default(0),
    homeWinBps: integer('home_win_bps').notNull().default(0),
    drawBps: integer('draw_bps').notNull().default(0),
    awayWinBps: integer('away_win_bps').notNull().default(0),
    minimumSample: integer('minimum_sample').notNull(),
    underdogThresholdBps: integer('underdog_threshold_bps').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('match_social_odds_snapshots_match_unique').on(t.matchId)],
)

export type MatchSocialOddsSnapshot = typeof matchSocialOddsSnapshots.$inferSelect
export type NewMatchSocialOddsSnapshot = typeof matchSocialOddsSnapshots.$inferInsert
