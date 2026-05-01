import { eq, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matches } from '../db/schema/index.js'
import { publishMatchStatusChanged } from '../realtime/publisher.js'

const identifier = process.argv[2]

if (!identifier) {
  console.error('Usage: tsx src/dev/lock-match.ts <MATCH_ID_OR_API_FOOTBALL_ID>')
  process.exit(1)
}

const [match] = await db
  .select({
    id: matches.id,
    apiFootballId: matches.apiFootballId,
    kickoffTime: matches.kickoffTime,
  })
  .from(matches)
  .where(or(eq(matches.id, identifier), eq(matches.apiFootballId, identifier)))
  .limit(1)

if (!match) {
  console.error(`Match "${identifier}" was not found.`)
  process.exit(1)
}

await db.update(matches).set({ status: 'LOCKED' }).where(eq(matches.id, match.id))

await publishMatchStatusChanged({
  matchId: match.id,
  status: 'LOCKED',
  kickoffTime: match.kickoffTime.toISOString(),
  changedAt: new Date().toISOString(),
})

console.info(`Locked match ${match.id} (${match.apiFootballId ?? 'no-api-id'})`)
process.exit(0)
