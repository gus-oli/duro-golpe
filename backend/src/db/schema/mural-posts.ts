import { boolean, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { leagues } from './leagues.js'
import { matches } from './matches.js'
import { users } from './users.js'

export const muralPosts = pgTable(
  'mural_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leagueId: uuid('league_id')
      .notNull()
      .references(() => leagues.id, { onDelete: 'cascade' }),
    matchId: uuid('match_id').references(() => matches.id, { onDelete: 'set null' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: varchar('content', { length: 500 }).notNull(),
    isHidden: boolean('is_hidden').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('mural_posts_league_feed_idx').on(t.leagueId, t.createdAt),
    index('mural_posts_match_context_idx').on(t.leagueId, t.matchId, t.createdAt),
  ],
)

export type MuralPost = typeof muralPosts.$inferSelect
export type NewMuralPost = typeof muralPosts.$inferInsert
