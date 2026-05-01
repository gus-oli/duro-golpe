import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  outrightMarketResults,
  outrightMarkets,
  outrightPredictions,
  outrightScores,
} from '../db/schema/index.js'
import { recomputeUserTotal } from '../scoring/totals.js'
import { calculateOutrightPoints } from './resolution.js'
import type { OutrightMarketCode } from './catalog.js'
import { publishUserTotalsUpdated } from '../realtime/publisher.js'

export async function scoreResolvedOutrightMarket(marketId: string): Promise<string[]> {
  const [[market], resolvedOptions, predictionRows, existingScores] = await Promise.all([
    db.select().from(outrightMarkets).where(eq(outrightMarkets.id, marketId)).limit(1),
    db.select({ optionId: outrightMarketResults.optionId }).from(outrightMarketResults).where(eq(outrightMarketResults.marketId, marketId)),
    db.select().from(outrightPredictions).where(eq(outrightPredictions.marketId, marketId)),
    db.select({ userId: outrightScores.userId }).from(outrightScores).where(eq(outrightScores.marketId, marketId)),
  ])

  if (!market) {
    const err = Object.assign(new Error('Mercado não encontrado'), { statusCode: 404 })
    throw err
  }

  const resolvedOptionIds = resolvedOptions.map((option) => option.optionId)
  const predictionsByUser = new Map<string, string[]>()

  for (const prediction of predictionRows) {
    const existing = predictionsByUser.get(prediction.userId) ?? []
    existing.push(prediction.optionId)
    predictionsByUser.set(prediction.userId, existing)
  }

  await db.delete(outrightScores).where(eq(outrightScores.marketId, marketId))

  const inserts = [...predictionsByUser.entries()].map(([userId, predictedOptionIds]) => ({
    userId,
    marketId,
    points: calculateOutrightPoints({
      marketCode: market.code as OutrightMarketCode,
      pointValue: market.pointValue,
      predictedOptionIds,
      resolvedOptionIds,
    }),
    calculatedAt: new Date(),
  }))

  if (inserts.length > 0) {
    await db.insert(outrightScores).values(inserts)
  }

  const affectedUserIds = [...new Set([...existingScores.map((score) => score.userId), ...inserts.map((score) => score.userId)])]
  for (const userId of affectedUserIds) {
    await recomputeUserTotal(userId)
  }

  await publishUserTotalsUpdated({
    matchId: null,
    affectedUserIds,
  })

  return affectedUserIds
}
