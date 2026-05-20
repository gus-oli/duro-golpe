import cron from 'node-cron'
import { db } from '../db/index.js'
import { matches, outrightMarkets } from '../db/schema/index.js'
import { eq, asc } from 'drizzle-orm'
import { createClient } from 'redis'
import { config } from '../config.js'

export const OUTRIGHT_LOCK_REDIS_KEY = 'outrights:locked'
export const OUTRIGHT_LOCK_BEFORE_MS = 60 * 60 * 1000

export async function syncOutrightLockState(now = new Date()): Promise<void> {
  const redis = createClient({ url: config.REDIS_URL })
  await redis.connect()

  try {
    const [firstMatch] = await db
      .select({ kickoffTime: matches.kickoffTime })
      .from(matches)
      .orderBy(asc(matches.kickoffTime))
      .limit(1)

    if (!firstMatch) return

    const lockAt = new Date(firstMatch.kickoffTime.getTime() - OUTRIGHT_LOCK_BEFORE_MS)
    if (now < lockAt) {
      await db.update(outrightMarkets).set({ status: 'OPEN' }).where(eq(outrightMarkets.status, 'LOCKED'))
      await redis.del(OUTRIGHT_LOCK_REDIS_KEY)
      return
    }

    const alreadyLocked = await redis.get(OUTRIGHT_LOCK_REDIS_KEY)
    if (alreadyLocked) return

    await db.update(outrightMarkets).set({ status: 'LOCKED' }).where(eq(outrightMarkets.status, 'OPEN'))
    await redis.set(OUTRIGHT_LOCK_REDIS_KEY, 'true')
    console.info('[OutrightLockScheduler] All outright markets locked')
  } finally {
    await redis.disconnect()
  }
}

export function startOutrightLockScheduler(): void {
  cron.schedule('* * * * *', async () => {
    try {
      await syncOutrightLockState()
    } catch (error) {
      console.error('[OutrightLockScheduler] Lock sync failed:', error)
    }
  })
  console.info('[OutrightLockScheduler] Started')
}
