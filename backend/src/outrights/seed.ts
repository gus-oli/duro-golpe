import { db } from '../db/index.js'
import { outrightMarkets, outrightOptions, teams } from '../db/schema/index.js'
import { and, eq, notInArray } from 'drizzle-orm'
import { OUTRIGHT_MARKET_CATALOG } from './catalog.js'
import { PLAYER_MARKET_OPTIONS } from './options-catalog.js'
import { filterSelectableOutrightTeams } from './team-options.js'

interface SeedableOutrightOption {
  label: string
  teamId: string | null
  sourceTier?: 'OFFICIAL' | 'PRELIMINARY' | 'LIKELY' | null
  isActive?: boolean
  isFeatured?: boolean
  sortOrder?: number
  teamLabel?: string | null
}

async function seedTeamMarketOptions(marketId: string, expectedOptions: SeedableOutrightOption[]): Promise<void> {
  const expectedLabels = expectedOptions.map((option) => option.label)

  for (const option of expectedOptions) {
    await db
      .insert(outrightOptions)
      .values({
        marketId,
        label: option.label,
        teamId: option.teamId,
        sourceTier: null,
        isActive: true,
        isFeatured: false,
        sortOrder: option.sortOrder ?? 0,
        teamLabel: null,
      })
      .onConflictDoUpdate({
        target: [outrightOptions.marketId, outrightOptions.label],
        set: {
          teamId: option.teamId,
          sourceTier: null,
          isActive: true,
          isFeatured: false,
          sortOrder: option.sortOrder ?? 0,
          teamLabel: null,
        },
      })
  }

  if (expectedLabels.length > 0) {
    await db
      .delete(outrightOptions)
      .where(and(eq(outrightOptions.marketId, marketId), notInArray(outrightOptions.label, expectedLabels)))
    return
  }

  await db.delete(outrightOptions).where(eq(outrightOptions.marketId, marketId))
}

async function seedPlayerMarketOptions(marketId: string, expectedOptions: SeedableOutrightOption[]): Promise<void> {
  const expectedLabels = expectedOptions.map((option) => option.label)

  for (const option of expectedOptions) {
    await db
      .insert(outrightOptions)
      .values({
        marketId,
        label: option.label,
        teamId: null,
        sourceTier: option.sourceTier ?? 'LIKELY',
        isActive: option.isActive ?? true,
        isFeatured: option.isFeatured ?? false,
        sortOrder: option.sortOrder ?? 0,
        teamLabel: option.teamLabel ?? null,
      })
      .onConflictDoUpdate({
        target: [outrightOptions.marketId, outrightOptions.label],
        set: {
          teamId: null,
          sourceTier: option.sourceTier ?? 'LIKELY',
          isActive: option.isActive ?? true,
          isFeatured: option.isFeatured ?? false,
          sortOrder: option.sortOrder ?? 0,
          teamLabel: option.teamLabel ?? null,
        },
      })
  }

  if (expectedLabels.length > 0) {
    await db
      .update(outrightOptions)
      .set({
        isActive: false,
        isFeatured: false,
      })
      .where(and(eq(outrightOptions.marketId, marketId), notInArray(outrightOptions.label, expectedLabels)))
    return
  }

  await db.update(outrightOptions).set({ isActive: false, isFeatured: false }).where(eq(outrightOptions.marketId, marketId))
}

export async function seedOutrightMarkets(): Promise<void> {
  for (const [index, market] of OUTRIGHT_MARKET_CATALOG.entries()) {
    await db
      .insert(outrightMarkets)
      .values({
        code: market.code,
        name: market.name,
        pointValue: market.pointValue,
        description: market.description,
        status: 'OPEN',
        selectionMin: market.selectionMin,
        selectionMax: market.selectionMax,
        sortOrder: index,
        optionType: market.optionType,
      })
      .onConflictDoUpdate({
        target: outrightMarkets.code,
        set: {
          name: market.name,
          pointValue: market.pointValue,
          description: market.description,
          selectionMin: market.selectionMin,
          selectionMax: market.selectionMax,
          sortOrder: index,
          optionType: market.optionType,
        },
      })
  }

  console.info(`Seeded ${OUTRIGHT_MARKET_CATALOG.length} outright markets`)
}

export async function seedOutrightOptions(): Promise<void> {
  const [marketRows, teamRows] = await Promise.all([
    db.select().from(outrightMarkets),
    db.select().from(teams).orderBy(teams.name),
  ])
  const selectableTeams = filterSelectableOutrightTeams(teamRows)

  for (const market of marketRows) {
    const expectedOptions: SeedableOutrightOption[] =
      market.optionType === 'TEAM'
        ? selectableTeams.map((team, index) => ({
            label: team.name,
            teamId: team.id,
            sortOrder: index,
          }))
        : (PLAYER_MARKET_OPTIONS[market.code as keyof typeof PLAYER_MARKET_OPTIONS] ?? []).map((option, index) => ({
            label: option.label,
            teamId: null,
            sourceTier: option.sourceTier,
            isActive: true,
            isFeatured: option.isFeatured,
            sortOrder: index,
            teamLabel: option.teamLabel,
          }))

    if (market.optionType === 'TEAM') {
      await seedTeamMarketOptions(market.id, expectedOptions)
      continue
    }

    await seedPlayerMarketOptions(market.id, expectedOptions)
  }

  console.info('Seeded outright options')
}
