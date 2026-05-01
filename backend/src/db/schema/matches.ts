import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { teams } from './teams.js'

export const matchStatusEnum = pgEnum('match_status', [
  'SCHEDULED',
  'LOCKED',
  'LIVE',
  'FINISHED',
])

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeTeamId: uuid('home_team_id')
    .notNull()
    .references(() => teams.id),
  awayTeamId: uuid('away_team_id')
    .notNull()
    .references(() => teams.id),
  kickoffTime: timestamp('kickoff_time', { withTimezone: true }).notNull(),
  stage: text('stage').notNull(),
  venue: text('venue'),
  status: matchStatusEnum('status').notNull().default('SCHEDULED'),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  apiFootballId: text('api_football_id').unique(),
})

export type Match = typeof matches.$inferSelect
export type NewMatch = typeof matches.$inferInsert
