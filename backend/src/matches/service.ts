import { and, eq, lte } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../db/index.js'
import { matchPredictions, matches, teams } from '../db/schema/index.js'
import { buildMatchDetailDto, buildMatchListItemDto, type MatchDetailDto, type MatchListItemDto } from './dto.js'
import type { Match } from '../db/schema/matches.js'
import { getEffectiveMatchStatus, getLockableKickoffThreshold } from './lock-utils.js'
import { getSocialOddsForMatch } from './social-odds.js'

export interface MatchFilter {
  stage?: string
  group?: string
}

const homeTeams = alias(teams, 'home_teams')
const awayTeams = alias(teams, 'away_teams')

function hasCompletePrediction(prediction: { predictedHome: number | null; predictedAway: number | null } | null): boolean {
  return prediction?.predictedHome !== null && prediction?.predictedHome !== undefined &&
    prediction.predictedAway !== null && prediction.predictedAway !== undefined
}

export async function getMatches(filter?: MatchFilter, userId?: string): Promise<MatchListItemDto[]> {
  const conditions = []
  if (filter?.stage) {
    conditions.push(eq(matches.stage, filter.stage))
  }

  if (userId) {
    const rows = await db
      .select({
        id: matches.id,
        kickoffTime: matches.kickoffTime,
        stage: matches.stage,
        venue: matches.venue,
        status: matches.status,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
        homeTeam: {
          id: homeTeams.id,
          name: homeTeams.name,
          fifaCode: homeTeams.fifaCode,
          flagUrl: homeTeams.flagUrl,
        },
        awayTeam: {
          id: awayTeams.id,
          name: awayTeams.name,
          fifaCode: awayTeams.fifaCode,
          flagUrl: awayTeams.flagUrl,
        },
        prediction: {
          predictedHome: matchPredictions.predictedHome,
          predictedAway: matchPredictions.predictedAway,
        },
      })
      .from(matches)
      .innerJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
      .innerJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
      .leftJoin(
        matchPredictions,
        and(eq(matchPredictions.matchId, matches.id), eq(matchPredictions.userId, userId)),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(matches.kickoffTime)

    return Promise.all(rows.map(async (row) => {
      const hasUserPrediction = hasCompletePrediction(row.prediction)
      const socialOdds = await getSocialOddsForMatch({
        matchId: row.id,
        effectiveStatus: getEffectiveMatchStatus(row.status, row.kickoffTime),
        hasUserPrediction,
      })

      return buildMatchListItemDto({
        ...row,
        prediction: row.prediction,
        socialOdds,
      })
    }))
  }

  const rows = await db
    .select({
      id: matches.id,
      kickoffTime: matches.kickoffTime,
      stage: matches.stage,
      venue: matches.venue,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeTeam: {
        id: homeTeams.id,
        name: homeTeams.name,
        fifaCode: homeTeams.fifaCode,
        flagUrl: homeTeams.flagUrl,
      },
      awayTeam: {
        id: awayTeams.id,
        name: awayTeams.name,
        fifaCode: awayTeams.fifaCode,
        flagUrl: awayTeams.flagUrl,
      },
    })
    .from(matches)
    .innerJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .innerJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(matches.kickoffTime)

  return Promise.all(rows.map(async (row) => {
    const socialOdds = await getSocialOddsForMatch({
      matchId: row.id,
      effectiveStatus: getEffectiveMatchStatus(row.status, row.kickoffTime),
      hasUserPrediction: false,
    })

    return buildMatchListItemDto({
      ...row,
      prediction: null,
      socialOdds,
    })
  }))
}

export async function getMatchById(matchId: string, userId?: string): Promise<MatchDetailDto | undefined> {
  if (userId) {
    const [row] = await db
      .select({
        id: matches.id,
        kickoffTime: matches.kickoffTime,
        stage: matches.stage,
        venue: matches.venue,
        status: matches.status,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
        homeTeam: {
          id: homeTeams.id,
          name: homeTeams.name,
          fifaCode: homeTeams.fifaCode,
          flagUrl: homeTeams.flagUrl,
        },
        awayTeam: {
          id: awayTeams.id,
          name: awayTeams.name,
          fifaCode: awayTeams.fifaCode,
          flagUrl: awayTeams.flagUrl,
        },
        prediction: {
          predictedHome: matchPredictions.predictedHome,
          predictedAway: matchPredictions.predictedAway,
        },
      })
      .from(matches)
      .innerJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
      .innerJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
      .leftJoin(
        matchPredictions,
        and(eq(matchPredictions.matchId, matches.id), eq(matchPredictions.userId, userId)),
      )
      .where(eq(matches.id, matchId))
      .limit(1)

    if (!row) {
      return undefined
    }

    const hasUserPrediction = hasCompletePrediction(row.prediction)
    const socialOdds = await getSocialOddsForMatch({
      matchId: row.id,
      effectiveStatus: getEffectiveMatchStatus(row.status, row.kickoffTime),
      hasUserPrediction,
    })

    return buildMatchDetailDto({
      ...row,
      prediction: row.prediction,
      socialOdds,
    })
  }

  const [row] = await db
    .select({
      id: matches.id,
      kickoffTime: matches.kickoffTime,
      stage: matches.stage,
      venue: matches.venue,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeTeam: {
        id: homeTeams.id,
        name: homeTeams.name,
        fifaCode: homeTeams.fifaCode,
        flagUrl: homeTeams.flagUrl,
      },
      awayTeam: {
        id: awayTeams.id,
        name: awayTeams.name,
        fifaCode: awayTeams.fifaCode,
        flagUrl: awayTeams.flagUrl,
      },
    })
    .from(matches)
    .innerJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .innerJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(eq(matches.id, matchId))
    .limit(1)

  if (!row) {
    return undefined
  }

  return buildMatchDetailDto({
    ...row,
    prediction: null,
    socialOdds: await getSocialOddsForMatch({
      matchId: row.id,
      effectiveStatus: getEffectiveMatchStatus(row.status, row.kickoffTime),
      hasUserPrediction: false,
    }),
  })
}

export async function lockMatch(matchId: string): Promise<boolean> {
  const updated = await db
    .update(matches)
    .set({ status: 'LOCKED' })
    .where(and(eq(matches.id, matchId), eq(matches.status, 'SCHEDULED')))
    .returning({ id: matches.id })

  return updated.length > 0
}

export async function getMatchesToLock(now: Date): Promise<Match[]> {
  return db
    .select()
    .from(matches)
    .where(and(eq(matches.status, 'SCHEDULED'), lte(matches.kickoffTime, getLockableKickoffThreshold(now))))
}
