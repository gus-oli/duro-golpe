import { pgTable, varchar } from 'drizzle-orm/pg-core'

export const badges = pgTable('badges', {
  type: varchar('type', { length: 50 }).primaryKey(),
  labelPt: varchar('label_pt', { length: 100 }).notNull(),
  descriptionPt: varchar('description_pt', { length: 300 }).notNull(),
  iconKey: varchar('icon_key', { length: 50 }).notNull(),
})

export type Badge = typeof badges.$inferSelect
export type NewBadge = typeof badges.$inferInsert
