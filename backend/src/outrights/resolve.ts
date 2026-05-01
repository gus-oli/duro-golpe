import { eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { outrightMarkets, outrightOptions } from '../db/schema/index.js'
import { recordOutrightMarketResult } from './service.js'

function normalizeCliValues(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
}

const args = process.argv.slice(2)
const marketCode = args[0]
const optionValues = normalizeCliValues(args.slice(1))

if (!marketCode || optionValues.length === 0) {
  console.error('Usage: tsx src/outrights/resolve.ts <MARKET_CODE> <OPTION_LABEL_OR_ID> [MORE_OPTIONS...]')
  process.exit(1)
}

const [market] = await db
  .select()
  .from(outrightMarkets)
  .where(eq(outrightMarkets.code, marketCode))
  .limit(1)

if (!market) {
  console.error(`Market with code "${marketCode}" was not found.`)
  process.exit(1)
}

const options = await db
  .select({ id: outrightOptions.id, label: outrightOptions.label })
  .from(outrightOptions)
  .where(eq(outrightOptions.marketId, market.id))

const matchingOptionIds = optionValues.map((value) => {
  const byId = options.find((option) => option.id === value)
  if (byId) {
    return byId.id
  }

  const byLabel = options.find((option) => option.label.toLowerCase() === value.toLowerCase())
  return byLabel?.id
})

if (matchingOptionIds.some((optionId) => !optionId)) {
  console.error('One or more provided options did not match this market by id or label.')
  console.error(`Available options: ${options.map((option) => option.label).join(', ')}`)
  process.exit(1)
}

const resolved = await recordOutrightMarketResult(market.id, matchingOptionIds.filter(Boolean) as string[])
const savedOptions = await db
  .select({ label: outrightOptions.label })
  .from(outrightOptions)
  .where(inArray(outrightOptions.id, resolved.optionIds))

console.info(`Resolved ${market.name} at ${resolved.resolvedAt}: ${savedOptions.map((option) => option.label).join(', ')}`)
process.exit(0)
