import { db } from '../db/index.js'
import { getTeams, getFixtures } from './api-football.js'
import { validateTournamentCounts } from '../tournament/constants.js'
import { seedCatalogs, upsertMatches, upsertTeams } from '../seeds/support.js'

async function seedTeams(): Promise<Map<number, string>> {
  const apiTeams = await getTeams()
  const idMap = new Map<number, string>()
  const idsByKey = await upsertTeams(
    apiTeams.map((apiTeam) => ({
      key: String(apiTeam.id),
      apiFootballId: String(apiTeam.id),
      name: apiTeam.name,
      fifaCode: apiTeam.code,
      flagUrl: apiTeam.logo,
    })),
  )

  for (const apiTeam of apiTeams) {
    const teamId = idsByKey[String(apiTeam.id)]
    if (teamId) {
      idMap.set(apiTeam.id, teamId)
    }
  }

  console.info(`Seeded ${idMap.size} teams`)
  return idMap
}

async function seedMatches(teamIdMap: Map<number, string>): Promise<void> {
  const fixtures = await getFixtures()
  validateTournamentCounts({ teamCount: teamIdMap.size, matchCount: fixtures.length })
  const usableFixtures = fixtures.filter(
    (fixture) => teamIdMap.has(fixture.teams.home.id) && teamIdMap.has(fixture.teams.away.id),
  )

  await upsertMatches(
    usableFixtures.map((fixture) => ({
      apiFootballId: String(fixture.id),
      homeTeamKey: String(fixture.teams.home.id),
      awayTeamKey: String(fixture.teams.away.id),
      kickoffTime: new Date(fixture.date),
      stage: fixture.league.round,
      venue: fixture.venue.name,
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
    })),
    Object.fromEntries(
      Array.from(teamIdMap.entries(), ([teamApiId, teamId]) => [String(teamApiId), teamId]),
    ),
  )

  console.info(`Seeded ${usableFixtures.length} matches`)
}

const teamIdMap = await seedTeams()
await seedMatches(teamIdMap)
await seedCatalogs()
process.exit(0)
