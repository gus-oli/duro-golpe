import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  type OutrightOption,
  outrightMarketResults,
  outrightMarkets,
  outrightOptions,
  outrightPredictions,
} from '../db/schema/index.js'
import { scoreResolvedOutrightMarket } from './scoring.js'
import { normalizeOutrightOptionIds, validateSelectionCardinality } from './outright-utils.js'

export { validateFinalistsPrediction } from './outright-utils.js'

function sortMarketOptions(options: OutrightOption[]): OutrightOption[] {
  return [...options].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1
    }

    if (left.isFeatured !== right.isFeatured) {
      return left.isFeatured ? -1 : 1
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }

    return left.label.localeCompare(right.label)
  })
}

export async function getOutrights(userId: string): Promise<unknown[]> {
  const [markets, options, userPredictions] = await Promise.all([
    db.select().from(outrightMarkets).orderBy(outrightMarkets.sortOrder),
    db.select().from(outrightOptions),
    db.select().from(outrightPredictions).where(eq(outrightPredictions.userId, userId)),
  ])

  return markets.map((market) => {
    const marketOptions = sortMarketOptions(options.filter((option) => option.marketId === market.id))
    const selectedOptionIds = userPredictions
      .filter((prediction) => prediction.marketId === market.id)
      .map((prediction) => prediction.optionId)

    return {
      ...market,
      options: marketOptions,
      userPrediction: selectedOptionIds[0] ? { optionId: selectedOptionIds[0] } : null,
      userSelections: selectedOptionIds,
    }
  })
}

export async function createOutrightPrediction(
  userId: string,
  marketId: string,
  optionIds: string[],
): Promise<{ optionIds: string[]; submittedAt: string }> {
  const [market] = await db
    .select()
    .from(outrightMarkets)
    .where(eq(outrightMarkets.id, marketId))
    .limit(1)

  if (!market) {
    const err = Object.assign(new Error('Mercado não encontrado'), { statusCode: 404 })
    throw err
  }

  if (market.status !== 'OPEN') {
    const err = Object.assign(new Error('Mercado encerrado'), { statusCode: 403 })
    throw err
  }

  if (!validateSelectionCardinality(optionIds, market.selectionMin, market.selectionMax)) {
    const err = Object.assign(
      new Error(`Este mercado exige entre ${market.selectionMin} e ${market.selectionMax} seleção(ões).`),
      { statusCode: 400 },
    )
    throw err
  }

  const normalizedOptionIds = normalizeOutrightOptionIds(optionIds)
  const marketOptions = await db
    .select({ id: outrightOptions.id })
    .from(outrightOptions)
    .where(and(eq(outrightOptions.marketId, marketId), inArray(outrightOptions.id, normalizedOptionIds)))

  if (marketOptions.length !== normalizedOptionIds.length) {
    const err = Object.assign(new Error('Uma ou mais opções não pertencem a este mercado.'), { statusCode: 400 })
    throw err
  }

  const submittedAt = new Date()

  await db
    .delete(outrightPredictions)
    .where(and(eq(outrightPredictions.userId, userId), eq(outrightPredictions.marketId, marketId)))

  await db.insert(outrightPredictions).values(
    normalizedOptionIds.map((optionId) => ({
      userId,
      marketId,
      optionId,
      submittedAt,
    })),
  )

  return {
    optionIds: normalizedOptionIds,
    submittedAt: submittedAt.toISOString(),
  }
}

export async function recordOutrightMarketResult(
  marketId: string,
  optionIds: string[],
  notes?: string,
): Promise<{ optionIds: string[]; resolvedAt: string }> {
  const [market] = await db
    .select()
    .from(outrightMarkets)
    .where(eq(outrightMarkets.id, marketId))
    .limit(1)

  if (!market) {
    const err = Object.assign(new Error('Mercado não encontrado'), { statusCode: 404 })
    throw err
  }

  if (!validateSelectionCardinality(optionIds, market.selectionMin, market.selectionMax)) {
    const err = Object.assign(
      new Error(`Este mercado exige entre ${market.selectionMin} e ${market.selectionMax} opção(ões) vencedora(s).`),
      { statusCode: 400 },
    )
    throw err
  }

  const normalizedOptionIds = normalizeOutrightOptionIds(optionIds)
  if (normalizedOptionIds.length === 0) {
    const err = Object.assign(new Error('Informe ao menos uma opção vencedora.'), { statusCode: 400 })
    throw err
  }

  if (normalizedOptionIds.length !== optionIds.length) {
    const err = Object.assign(new Error('Opções vencedoras duplicadas não são permitidas.'), { statusCode: 400 })
    throw err
  }

  const marketOptions = await db
    .select({ id: outrightOptions.id })
    .from(outrightOptions)
    .where(and(eq(outrightOptions.marketId, marketId), inArray(outrightOptions.id, normalizedOptionIds)))

  if (marketOptions.length !== normalizedOptionIds.length) {
    const err = Object.assign(new Error('Uma ou mais opções vencedoras não pertencem a este mercado.'), {
      statusCode: 400,
    })
    throw err
  }

  const resolvedAt = new Date()

  await db.delete(outrightMarketResults).where(eq(outrightMarketResults.marketId, marketId))
  await db.insert(outrightMarketResults).values(
    normalizedOptionIds.map((optionId) => ({
      marketId,
      optionId,
      notes,
      resolvedAt,
    })),
  )

  await db.update(outrightMarkets).set({ status: 'RESOLVED' }).where(eq(outrightMarkets.id, marketId))
  await scoreResolvedOutrightMarket(marketId)

  return {
    optionIds: normalizedOptionIds,
    resolvedAt: resolvedAt.toISOString(),
  }
}
