import { getPlayableFootballDataScore, getWorldCupMatches, getWorldCupTeams, formatFootballDataStage } from './football-data.js'
import { mapFootballDataStatus } from '../realtime/events.js'
import { validateTournamentCounts } from '../tournament/constants.js'
import type { SeedTeamInput } from '../seeds/support.js'
import { seedCatalogs, upsertMatches, upsertTeams } from '../seeds/support.js'
import { localizeTeamName } from '../seeds/team-localization.js'
import { syncOutrightLockState } from '../outrights/lock-scheduler.js'

async function seedTeams(): Promise<Map<number, string>> {
  const providerTeams = await getWorldCupTeams()
  const idMap = new Map<number, string>()
  const idsByKey = await upsertTeams(
    providerTeams.map((team) => {
      if (!team.tla) {
        throw new Error(`football-data team ${team.id} is missing tla/code`)
      }

      return {
        key: String(team.id),
        apiFootballId: String(team.id),
        name: localizeTeamName(team.tla, team.name),
        fifaCode: team.tla,
        flagUrl: team.crest,
      }
    }),
  )

  for (const team of providerTeams) {
    const teamId = idsByKey[String(team.id)]
    if (teamId) {
      idMap.set(team.id, teamId)
    }
  }

  console.info(`Seeded ${idMap.size} teams`)
  return idMap
}

function getPlaceholderStagePrefix(stage: string | null): string {
  switch (stage) {
    case 'LAST_32':
      return 'R32'
    case 'LAST_16':
      return 'R16'
    case 'QUARTER_FINALS':
      return 'QF'
    case 'SEMI_FINALS':
      return 'SF'
    case 'THIRD_PLACE':
      return '3P'
    case 'FINAL':
      return 'FIN'
    default:
      return 'KO'
  }
}

function buildPlaceholderTeams(fixtures: Awaited<ReturnType<typeof getWorldCupMatches>>): SeedTeamInput[] {
  const placeholderTeams: SeedTeamInput[] = []
  const stageSequence = new Map<string, number>()

  for (const fixture of fixtures) {
    if (fixture.homeTeam.id != null && fixture.awayTeam.id != null) {
      continue
    }

    const stagePrefix = getPlaceholderStagePrefix(fixture.stage)
    const nextSequence = (stageSequence.get(stagePrefix) ?? 0) + 1
    stageSequence.set(stagePrefix, nextSequence)

    const slotBase = `${stagePrefix}${String(nextSequence).padStart(2, '0')}`

    if (fixture.homeTeam.id == null) {
      placeholderTeams.push({
        key: `slot:${fixture.id}:home`,
        apiFootballId: null,
        name: `A definir ${slotBase}A`,
        fifaCode: `${slotBase}A`,
        flagUrl: null,
      })
    }

    if (fixture.awayTeam.id == null) {
      placeholderTeams.push({
        key: `slot:${fixture.id}:away`,
        apiFootballId: null,
        name: `A definir ${slotBase}B`,
        fifaCode: `${slotBase}B`,
        flagUrl: null,
      })
    }
  }

  return placeholderTeams
}

async function seedMatches(teamIdMap: Map<number, string>): Promise<void> {
  const fixtures = await getWorldCupMatches()
  validateTournamentCounts({ teamCount: teamIdMap.size, matchCount: fixtures.length })
  const placeholderTeams = buildPlaceholderTeams(fixtures)
  const placeholderTeamIdsByKey =
    placeholderTeams.length > 0 ? await upsertTeams(placeholderTeams) : {}

  const teamIdsByKey = {
    ...Object.fromEntries(
      Array.from(teamIdMap.entries(), ([teamApiId, teamId]) => [String(teamApiId), teamId]),
    ),
    ...placeholderTeamIdsByKey,
  }

  await upsertMatches(
    fixtures.map((fixture) => {
      const playableScore = getPlayableFootballDataScore(fixture.score)

      return {
        apiFootballId: String(fixture.id),
        homeTeamKey:
          fixture.homeTeam.id != null ? String(fixture.homeTeam.id) : `slot:${fixture.id}:home`,
        awayTeamKey:
          fixture.awayTeam.id != null ? String(fixture.awayTeam.id) : `slot:${fixture.id}:away`,
        kickoffTime: new Date(fixture.utcDate),
        stage: formatFootballDataStage(fixture.stage, fixture.group),
        venue: fixture.venue,
        status: mapFootballDataStatus(fixture.status) ?? 'SCHEDULED',
        homeScore: playableScore.home,
        awayScore: playableScore.away,
      }
    }),
    teamIdsByKey,
  )

  console.info(`Seeded ${fixtures.length} matches`)
}

const teamIdMap = await seedTeams()
await seedMatches(teamIdMap)
await seedCatalogs()
await syncOutrightLockState()
process.exit(0)
