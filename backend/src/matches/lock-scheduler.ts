import cron from 'node-cron'
import { getMatchesToLock, lockMatch } from './service.js'
import { publishMatchStatusChanged } from '../realtime/publisher.js'
import { createOrUpdateSocialOddsSnapshot } from './social-odds.js'
export { shouldLockMatch } from './lock-utils.js'

export function startLockScheduler(): void {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    try {
      const tolock = await getMatchesToLock(now)
      for (const match of tolock) {
        const locked = await lockMatch(match.id)
        if (!locked) continue

        await createOrUpdateSocialOddsSnapshot(match.id)

        await publishMatchStatusChanged({
          matchId: match.id,
          status: 'LOCKED',
          kickoffTime: match.kickoffTime.toISOString(),
          changedAt: new Date().toISOString(),
        })

        console.info(`[LockScheduler] Locked match ${match.id} (kickoff: ${match.kickoffTime.toISOString()})`)
      }
    } catch (err) {
      console.error('[LockScheduler] Error locking matches:', err)
    }
  })
  console.info('[LockScheduler] Started — checking every minute')
}
