import { backfillMissingSocialOddsSnapshots } from '../matches/social-odds.js'

try {
  const created = await backfillMissingSocialOddsSnapshots()
  console.info(`[SocialOddsBackfill] Created ${created} missing social odds snapshots`)
  process.exit(0)
} catch (error) {
  console.error('[SocialOddsBackfill] Failed:', error)
  process.exit(1)
}
