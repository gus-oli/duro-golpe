import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { outrightMarketResults, outrightMarkets, matches, teams } from '../db/schema/index.js'
import { seedBadges } from '../badges/seed.js'
import { seedOutrightMarkets, seedOutrightOptions } from '../outrights/seed.js'

export type SeedMatchStatus = 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'

export interface SeedTeamInput {
  key: string
  name: string
  fifaCode: string
  flagUrl?: string | null
  groupLetter?: string | null
  apiFootballId?: string | null
}

export interface SeedMatchInput {
  apiFootballId: string
  homeTeamKey: string
  awayTeamKey: string
  kickoffTime: Date
  stage: string
  venue?: string | null
  status: SeedMatchStatus
  homeScore?: number | null
  awayScore?: number | null
}

function requireRecordValue(record: Record<string, string>, key: string, label: string): string {
  const value = record[key]
  if (!value) {
    throw new Error(`Missing ${label} for key "${key}"`)
  }

  return value
}

export async function upsertTeams(teamInputs: SeedTeamInput[]): Promise<Record<string, string>> {
  const idsByKey: Record<string, string> = {}

  for (const team of teamInputs) {
    const values = {
      name: team.name,
      fifaCode: team.fifaCode,
      flagUrl: team.flagUrl,
      groupLetter: team.groupLetter ?? null,
      apiFootballId: team.apiFootballId ?? null,
    }

    const [row] = await db
      .insert(teams)
      .values(values)
      .onConflictDoUpdate({
        target: teams.fifaCode,
        set: {
          name: team.name,
          flagUrl: team.flagUrl,
          groupLetter: team.groupLetter ?? null,
          apiFootballId: team.apiFootballId ?? null,
        },
      })
      .returning({ id: teams.id })

    if (!row?.id) {
      throw new Error(`Unable to upsert team ${team.fifaCode}`)
    }

    idsByKey[team.key] = row.id
  }

  return idsByKey
}

export async function upsertMatches(
  matchInputs: SeedMatchInput[],
  teamIdsByKey: Record<string, string>,
): Promise<Record<string, string>> {
  const idsByApiFootballId: Record<string, string> = {}

  for (const match of matchInputs) {
    const homeTeamId = requireRecordValue(teamIdsByKey, match.homeTeamKey, 'team id')
    const awayTeamId = requireRecordValue(teamIdsByKey, match.awayTeamKey, 'team id')

    const [row] = await db
      .insert(matches)
      .values({
        homeTeamId,
        awayTeamId,
        kickoffTime: match.kickoffTime,
        stage: match.stage,
        venue: match.venue ?? null,
        status: match.status,
        homeScore: match.homeScore ?? null,
        awayScore: match.awayScore ?? null,
        apiFootballId: match.apiFootballId,
      })
      .onConflictDoUpdate({
        target: matches.apiFootballId,
        set: {
          homeTeamId,
          awayTeamId,
          kickoffTime: match.kickoffTime,
          stage: match.stage,
          venue: match.venue ?? null,
          status: match.status,
          homeScore: match.homeScore ?? null,
          awayScore: match.awayScore ?? null,
        },
      })
      .returning({ id: matches.id })

    if (!row?.id) {
      throw new Error(`Unable to upsert match ${match.apiFootballId}`)
    }

    idsByApiFootballId[match.apiFootballId] = row.id
  }

  return idsByApiFootballId
}

export async function resetOutrightState(): Promise<void> {
  await db.delete(outrightMarketResults)
  await db.update(outrightMarkets).set({ status: 'OPEN' })
}

export async function seedCatalogs(options?: { resetOutrights?: boolean }): Promise<void> {
  if (options?.resetOutrights) {
    await resetOutrightState()
  }

  await seedOutrightMarkets()
  await seedOutrightOptions()
  await seedBadges()
}

export async function getMatchIdByApiFootballId(apiFootballId: string): Promise<string> {
  const [match] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.apiFootballId, apiFootballId))
    .limit(1)

  if (!match) {
    throw new Error(`Match ${apiFootballId} not found`)
  }

  return match.id
}
