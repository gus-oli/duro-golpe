import { db } from '../db/index.js'
import {
  leagueMemberships,
  leagues,
  matchPredictions,
  matchResults,
  matchScores,
  matches,
  muralPosts,
  outrightMarketResults,
  outrightMarkets,
  outrightPredictions,
  outrightScores,
  teams,
  userBadges,
  users,
  userTotals,
} from '../db/schema/index.js'

const CONFIRM_FLAG = '--confirm'

async function run(): Promise<void> {
  if (!process.argv.includes(CONFIRM_FLAG)) {
    console.error(
      `[BetaReset] Refusing to continue without ${CONFIRM_FLAG}. This command destroys the current beta application data on the configured database.`,
    )
    process.exitCode = 1
    return
  }

  console.info('[BetaReset] Clearing resettable beta application state...')

  await db.transaction(async (tx) => {
    await tx.delete(muralPosts)
    await tx.delete(matchScores)
    await tx.delete(matchResults)
    await tx.delete(matchPredictions)
    await tx.delete(outrightScores)
    await tx.delete(outrightPredictions)
    await tx.delete(outrightMarketResults)
    await tx.delete(userBadges)
    await tx.delete(userTotals)
    await tx.delete(leagueMemberships)
    await tx.delete(leagues)
    await tx.delete(outrightMarkets)
    await tx.delete(matches)
    await tx.delete(teams)
    await tx.delete(users)
  })

  console.info('[BetaReset] Beta data cleared. Run migrations if needed, then reseed with provider-backed fixtures.')
}

run().catch((error) => {
  console.error('[BetaReset] Failed to clear beta state.', error)
  process.exitCode = 1
})
