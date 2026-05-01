import { integer, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { badges } from './badges.js'
import { matches } from './matches.js'

export const userBadges = pgTable(
  'user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeType: varchar('badge_type', { length: 50 })
      .notNull()
      .references(() => badges.type),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
    triggerMatchId: uuid('trigger_match_id').references(() => matches.id, { onDelete: 'set null' }),
    zebraCount: integer('zebra_count').notNull().default(1),
  },
  (t) => [unique('user_badges_user_badge_unique').on(t.userId, t.badgeType)],
)

export type UserBadge = typeof userBadges.$inferSelect
export type NewUserBadge = typeof userBadges.$inferInsert
