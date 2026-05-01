import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  fifaCode: text('fifa_code').notNull().unique(),
  groupLetter: text('group_letter'),
  flagUrl: text('flag_url'),
  apiFootballId: text('api_football_id').unique(),
})

export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
