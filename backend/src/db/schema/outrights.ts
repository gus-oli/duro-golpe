import { boolean, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { teams } from './teams.js'
import { users } from './users.js'
import { OUTRIGHT_PLAYER_SOURCE_TIERS } from '../../outrights/player-option-types.js'

export const outrightStatusEnum = pgEnum('outright_status', ['OPEN', 'LOCKED', 'RESOLVED'])
export const outrightOptionTypeEnum = pgEnum('outright_option_type', ['TEAM', 'PLAYER'])
export const outrightPlayerSourceTierEnum = pgEnum('outright_player_source_tier', OUTRIGHT_PLAYER_SOURCE_TIERS)

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
    sourceTier: outrightPlayerSourceTierEnum('source_tier'),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    teamLabel: text('team_label'),
    playerPhotoUrl: text('player_photo_url'),
    playerPhotoSource: text('player_photo_source'),
    playerPhotoUpdatedAt: timestamp('player_photo_updated_at', { withTimezone: true }),
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
export type OutrightPlayerSourceTier = (typeof OUTRIGHT_PLAYER_SOURCE_TIERS)[number]
