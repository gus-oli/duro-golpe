import { db } from '../db/index.js'
import { outrightMarkets, outrightOptions, teams } from '../db/schema/index.js'
import { and, eq, notInArray } from 'drizzle-orm'
import { OUTRIGHT_MARKET_CATALOG } from './catalog.js'
import { PLAYER_MARKET_OPTIONS } from './options-catalog.js'

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

  for (const market of marketRows) {
    const expectedOptions =
      market.optionType === 'TEAM'
        ? teamRows.map((team) => ({
            label: team.name,
            teamId: team.id,
          }))
        : ((PLAYER_MARKET_OPTIONS[market.code as keyof typeof PLAYER_MARKET_OPTIONS] ?? []) as string[]).map((label) => ({
            label,
            teamId: null,
          }))

    const expectedLabels = expectedOptions.map((option) => option.label)
    for (const option of expectedOptions) {
      await db
        .insert(outrightOptions)
        .values({
          marketId: market.id,
          label: option.label,
          teamId: option.teamId,
        })
        .onConflictDoUpdate({
          target: [outrightOptions.marketId, outrightOptions.label],
          set: {
            teamId: option.teamId,
          },
        })
    }

    if (expectedLabels.length > 0) {
      await db
        .delete(outrightOptions)
        .where(and(eq(outrightOptions.marketId, market.id), notInArray(outrightOptions.label, expectedLabels)))
    } else {
      await db.delete(outrightOptions).where(eq(outrightOptions.marketId, market.id))
    }
  }

  console.info('Seeded outright options')
}
