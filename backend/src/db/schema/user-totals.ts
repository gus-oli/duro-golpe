import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const userTotals = pgTable('user_totals', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalPoints: integer('total_points').notNull().default(0),
  matchPoints: integer('match_points').notNull().default(0),
  outrightPoints: integer('outright_points').notNull().default(0),
  exactScoreCount: integer('exact_score_count').notNull().default(0),
  winnerGoalDiffCount: integer('winner_goal_diff_count').notNull().default(0),
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type UserTotal = typeof userTotals.$inferSelect
export type NewUserTotal = typeof userTotals.$inferInsert
