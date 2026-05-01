import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const leagues = pgTable('leagues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const leagueMemberships = pgTable('league_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  leagueId: uuid('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
})

export type League = typeof leagues.$inferSelect
export type NewLeague = typeof leagues.$inferInsert
export type LeagueMembership = typeof leagueMemberships.$inferSelect
