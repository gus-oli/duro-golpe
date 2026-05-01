import { db } from '../db/index.js'
import { teams, matches } from '../db/schema/index.js'
import { getTeams, getFixtures } from './api-football.js'
import { eq } from 'drizzle-orm'
import { seedBadges } from '../badges/seed.js'
import { validateTournamentCounts } from '../tournament/constants.js'
import { seedOutrightMarkets, seedOutrightOptions } from '../outrights/seed.js'

async function seedTeams(): Promise<Map<number, string>> {
  const apiTeams = await getTeams()
  const idMap = new Map<number, string>()

  for (const apiTeam of apiTeams) {
    const [row] = await db
      .insert(teams)
      .values({
        name: apiTeam.name,
        fifaCode: apiTeam.code,
        flagUrl: apiTeam.logo,
        apiFootballId: String(apiTeam.id),
      })
      .onConflictDoUpdate({
        target: teams.apiFootballId,
        set: { name: apiTeam.name, flagUrl: apiTeam.logo },
      })
      .returning({ id: teams.id, apiFootballId: teams.apiFootballId })

    if (row?.apiFootballId) {
      idMap.set(apiTeam.id, row.id)
    }
  }

  console.info(`Seeded ${idMap.size} teams`)
  return idMap
}

async function seedMatches(teamIdMap: Map<number, string>): Promise<void> {
  const fixtures = await getFixtures()
  validateTournamentCounts({ teamCount: teamIdMap.size, matchCount: fixtures.length })
  let count = 0

  for (const fixture of fixtures) {
    const homeId = teamIdMap.get(fixture.teams.home.id)
    const awayId = teamIdMap.get(fixture.teams.away.id)
    if (!homeId || !awayId) continue

    await db
      .insert(matches)
      .values({
        homeTeamId: homeId,
        awayTeamId: awayId,
        kickoffTime: new Date(fixture.date),
        stage: fixture.league.round,
        venue: fixture.venue.name,
        apiFootballId: String(fixture.id),
      })
      .onConflictDoUpdate({
        target: matches.apiFootballId,
        set: {
          kickoffTime: new Date(fixture.date),
          stage: fixture.league.round,
          venue: fixture.venue.name,
        },
      })

    count++
  }

  console.info(`Seeded ${count} matches`)
}

const teamIdMap = await seedTeams()
await seedMatches(teamIdMap)
await seedOutrightMarkets()
await seedOutrightOptions()
await seedBadges()
process.exit(0)
