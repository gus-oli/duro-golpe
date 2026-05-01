import cron from 'node-cron'
import { db } from '../db/index.js'
import { matches, outrightMarkets } from '../db/schema/index.js'
import { eq, asc } from 'drizzle-orm'
import { createClient } from 'redis'
import { config } from '../config.js'

const REDIS_KEY = 'outrights:locked'
const LOCK_BEFORE_MS = 60 * 60 * 1000 // 1 hour

export function startOutrightLockScheduler(): void {
  cron.schedule('* * * * *', async () => {
    const redis = createClient({ url: config.REDIS_URL })
    await redis.connect()

    try {
      const alreadyLocked = await redis.get(REDIS_KEY)
      if (alreadyLocked) return

      const [firstMatch] = await db
        .select({ kickoffTime: matches.kickoffTime })
        .from(matches)
        .orderBy(asc(matches.kickoffTime))
        .limit(1)

      if (!firstMatch) return

      const lockAt = new Date(firstMatch.kickoffTime.getTime() - LOCK_BEFORE_MS)
      if (new Date() >= lockAt) {
        await db.update(outrightMarkets).set({ status: 'LOCKED' }).where(eq(outrightMarkets.status, 'OPEN'))
        await redis.set(REDIS_KEY, 'true')
        console.info('[OutrightLockScheduler] All outright markets locked')
      }
    } finally {
      await redis.disconnect()
    }
  })
  console.info('[OutrightLockScheduler] Started')
}
