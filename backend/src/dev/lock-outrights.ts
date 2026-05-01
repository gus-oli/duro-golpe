import { eq } from 'drizzle-orm'
import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { outrightMarkets } from '../db/schema/index.js'
import { OUTRIGHT_LOCK_REDIS_KEY } from '../outrights/lock-scheduler.js'

const lockedMarkets = await db
  .update(outrightMarkets)
  .set({ status: 'LOCKED' })
  .where(eq(outrightMarkets.status, 'OPEN'))
  .returning({ id: outrightMarkets.id })

const redis = createClient({ url: config.REDIS_URL })
await redis.connect()
await redis.set(OUTRIGHT_LOCK_REDIS_KEY, 'true')
await redis.disconnect()

console.info(`Locked ${lockedMarkets.length} outright market(s)`)
process.exit(0)
