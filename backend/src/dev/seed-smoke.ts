import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { outrightMarketResults, outrightMarkets } from '../db/schema/index.js'
import { OUTRIGHT_LOCK_REDIS_KEY } from '../outrights/lock-scheduler.js'
import { buildSmokeMatches, SMOKE_TEAMS } from '../seeds/smoke-dataset.js'
import {
  seedCatalogs,
  upsertMatches as upsertSeedMatches,
  upsertTeams as upsertSeedTeams,
} from '../seeds/support.js'

async function upsertSmokeMatch(teamIds: Record<string, string>): Promise<string> {
  const matchIds = await upsertSeedMatches(buildSmokeMatches(), teamIds)
  const matchId = matchIds['900001']

  if (!matchId) {
    throw new Error('Smoke match not found after upsert')
  }

  return matchId
}

async function upsertSmokeTeams(): Promise<Record<string, string>> {
  return upsertSeedTeams(SMOKE_TEAMS)
}

async function main(): Promise<void> {
  const teamIds = await upsertSmokeTeams()
  const matchId = await upsertSmokeMatch(teamIds)
  await db.delete(outrightMarketResults)
  await db.update(outrightMarkets).set({ status: 'OPEN' })
  await seedCatalogs()

  const redis = createClient({ url: config.REDIS_URL })
  await redis.connect()
  await redis.del(OUTRIGHT_LOCK_REDIS_KEY)
  await redis.disconnect()

  console.info('[SmokeSeed] Ready')
  console.info(`[SmokeSeed] Match ID: ${matchId}`)
  console.info('[SmokeSeed] Teams: Brazil vs France')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
