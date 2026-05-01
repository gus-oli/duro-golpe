import { eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matches, teams } from '../db/schema/index.js'
import { seedBadges } from '../badges/seed.js'
import { seedOutrightMarkets, seedOutrightOptions } from '../outrights/seed.js'

const TEAM_FIXTURES = [
  {
    apiFootballId: 'smoke-team-bra',
    name: 'Brazil',
    fifaCode: 'BRA',
    flagUrl: 'https://example.com/flags/bra.png',
  },
  {
    apiFootballId: 'smoke-team-fra',
    name: 'France',
    fifaCode: 'FRA',
    flagUrl: 'https://example.com/flags/fra.png',
  },
] as const

const MATCH_FIXTURE = {
  apiFootballId: '900001',
  stage: 'Smoke Test',
  venue: 'Arena Smoke',
}

async function upsertTeams(): Promise<Record<string, string>> {
  const ids: Record<string, string> = {}

  for (const team of TEAM_FIXTURES) {
    const [row] = await db
      .insert(teams)
      .values({
        apiFootballId: team.apiFootballId,
        name: team.name,
        fifaCode: team.fifaCode,
        flagUrl: team.flagUrl,
      })
      .onConflictDoUpdate({
        target: teams.apiFootballId,
        set: {
          name: team.name,
          fifaCode: team.fifaCode,
          flagUrl: team.flagUrl,
        },
      })
      .returning({ id: teams.id, apiFootballId: teams.apiFootballId })

    if (row?.apiFootballId) {
      ids[row.apiFootballId] = row.id
    }
  }

  return ids
}

async function upsertMatch(teamIds: Record<string, string>): Promise<string> {
  const kickoffTime = new Date(Date.now() + 48 * 60 * 60 * 1000)

  await db.execute(sql`
    insert into "matches" (
      "home_team_id",
      "away_team_id",
      "kickoff_time",
      "stage",
      "venue",
      "status",
      "home_score",
      "away_score",
      "api_football_id"
    )
    values (
      ${teamIds['smoke-team-bra']},
      ${teamIds['smoke-team-fra']},
      ${kickoffTime},
      ${MATCH_FIXTURE.stage},
      ${MATCH_FIXTURE.venue},
      'SCHEDULED'::match_status,
      null,
      null,
      ${MATCH_FIXTURE.apiFootballId}
    )
    on conflict ("api_football_id") do update
    set
      "home_team_id" = excluded."home_team_id",
      "away_team_id" = excluded."away_team_id",
      "kickoff_time" = excluded."kickoff_time",
      "stage" = excluded."stage",
      "venue" = excluded."venue",
      "status" = excluded."status",
      "home_score" = excluded."home_score",
      "away_score" = excluded."away_score"
  `)

  const [match] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.apiFootballId, MATCH_FIXTURE.apiFootballId))
    .limit(1)

  if (!match) {
    throw new Error('Smoke match not found after upsert')
  }

  return match.id
}

async function main(): Promise<void> {
  const teamIds = await upsertTeams()
  const matchId = await upsertMatch(teamIds)
  await seedOutrightMarkets()
  await seedOutrightOptions()
  await seedBadges()

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
