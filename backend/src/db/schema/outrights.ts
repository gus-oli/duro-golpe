import { integer, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { teams } from './teams.js'
import { users } from './users.js'

export const outrightStatusEnum = pgEnum('outright_status', ['OPEN', 'LOCKED', 'RESOLVED'])
export const outrightOptionTypeEnum = pgEnum('outright_option_type', ['TEAM', 'PLAYER'])

export const outrightMarkets = pgTable('outright_markets', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull().unique(),
  pointValue: integer('point_value').notNull(),
  status: outrightStatusEnum('status').notNull().default('OPEN'),
  description: text('description').notNull(),
  selectionMin: integer('selection_min').notNull().default(1),
  selectionMax: integer('selection_max').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  optionType: outrightOptionTypeEnum('option_type').notNull(),
})

export const outrightOptions = pgTable(
  'outright_options',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => outrightMarkets.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    teamId: uuid('team_id').references(() => teams.id),
  },
  (t) => [unique().on(t.marketId, t.label)],
)

export const outrightPredictions = pgTable(
  'outright_predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    marketId: uuid('market_id')
      .notNull()
      .references(() => outrightMarkets.id, { onDelete: 'cascade' }),
    optionId: uuid('option_id')
      .notNull()
      .references(() => outrightOptions.id, { onDelete: 'cascade' }),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.marketId, t.optionId)],
)

export const outrightMarketResults = pgTable(
  'outright_market_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    marketId: uuid('market_id')
      .notNull()
      .references(() => outrightMarkets.id, { onDelete: 'cascade' }),
    optionId: uuid('option_id')
      .notNull()
      .references(() => outrightOptions.id, { onDelete: 'cascade' }),
    notes: text('notes'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.marketId, t.optionId)],
)

export type OutrightMarket = typeof outrightMarkets.$inferSelect
export type OutrightOption = typeof outrightOptions.$inferSelect
export type OutrightPrediction = typeof outrightPredictions.$inferSelect
export type OutrightMarketResult = typeof outrightMarketResults.$inferSelect
