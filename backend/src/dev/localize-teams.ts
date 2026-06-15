import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { teams } from '../db/schema/index.js'
import { TEAM_NAME_BY_FIFA_CODE } from '../seeds/team-localization.js'

let updated = 0

for (const [fifaCode, name] of Object.entries(TEAM_NAME_BY_FIFA_CODE)) {
  const rows = await db
    .update(teams)
    .set({ name })
    .where(eq(teams.fifaCode, fifaCode))
    .returning({ id: teams.id })

  updated += rows.length
}

console.info(`[TeamLocalization] Updated ${updated} team names`)
process.exit(0)
