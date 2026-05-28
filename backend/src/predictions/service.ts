import { and, asc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { leagueMemberships, matchPredictions, matches, teams, users } from '../db/schema/index.js'
import { getMatchById } from '../matches/service.js'
import type { MatchPrediction } from '../db/schema/predictions.js'
import { assertActiveLeagueMember } from '../auth/access-control.js'
import { alias } from 'drizzle-orm/pg-core'
import { shouldLockMatch } from '../matches/lock-utils.js'

const homeTeams = alias(teams, 'league_prediction_home_teams')
const awayTeams = alias(teams, 'league_prediction_away_teams')

export interface BatchPredictionInput {
  matchId: string
  predictedHome: number
  predictedAway: number
}

export interface BatchPredictionFailure {
  matchId: string
  message: string
  statusCode: number
}

export interface BatchPredictionResult {
  saved: MatchPrediction[]
  failed: BatchPredictionFailure[]
}

export interface LeagueMemberPredictionDto {
  userId: string
  displayName: string
  avatarUrl: string | null
  prediction: {
    predictedHome: number
    predictedAway: number
  } | null
  submittedAt: string | null
}

export interface LeagueUserMatchPredictionDto {
  matchId: string
  kickoffTime: string
  stage: string
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeTeam: {
    id: string
    name: string
    fifaCode: string
    flagUrl: string | null
  }
  awayTeam: {
    id: string
    name: string
    fifaCode: string
    flagUrl: string | null
  }
  prediction: {
    predictedHome: number
    predictedAway: number
  } | null
  submittedAt: string | null
}

async function assertPredictionOpen(matchId: string) {
  const match = await getMatchById(matchId)
  if (!match) {
    const err = Object.assign(new Error('Partida nao encontrada'), { statusCode: 404 })
    throw err
  }

  if (match.status !== 'SCHEDULED' || shouldLockMatch(new Date(match.kickoffTime), new Date())) {
    const err = Object.assign(new Error('Palpites encerrados para esta partida'), { statusCode: 403 })
    throw err
  }

  return match
}

async function getExistingPrediction(userId: string, matchId: string): Promise<MatchPrediction | undefined> {
  const [prediction] = await db
    .select()
    .from(matchPredictions)
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .limit(1)

  return prediction
}

async function assertTargetLeagueMember(leagueId: string, targetUserId: string): Promise<void> {
  const [membership] = await db
    .select({ userId: leagueMemberships.userId })
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, targetUserId),
        eq(leagueMemberships.isActive, true),
      ),
    )
    .limit(1)

  if (!membership) {
    throw Object.assign(new Error('Membro da liga nao encontrado'), { statusCode: 404 })
  }
}

export async function createPrediction(
  userId: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number,
): Promise<MatchPrediction> {
  await assertPredictionOpen(matchId)

  const existing = await getExistingPrediction(userId, matchId)
  if (existing) {
    const err = Object.assign(new Error('Palpite ja enviado para esta partida'), { statusCode: 409 })
    throw err
  }

  const [prediction] = await db
    .insert(matchPredictions)
    .values({ userId, matchId, predictedHome, predictedAway })
    .returning()

  return prediction!
}

export async function updatePrediction(
  userId: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number,
): Promise<MatchPrediction> {
  await assertPredictionOpen(matchId)

  const [updated] = await db
    .update(matchPredictions)
    .set({ predictedHome, predictedAway, submittedAt: new Date() })
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .returning()

  if (!updated) {
    const err = Object.assign(new Error('Palpite nao encontrado'), { statusCode: 404 })
    throw err
  }

  return updated
}

export async function getPredictionByUser(userId: string, matchId: string): Promise<MatchPrediction | undefined> {
  return getExistingPrediction(userId, matchId)
}

export async function getLeagueMatchPredictions(
  requestingUserId: string,
  leagueId: string,
  matchId: string,
): Promise<LeagueMemberPredictionDto[]> {
  await assertActiveLeagueMember(requestingUserId, leagueId)

  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      predictedHome: matchPredictions.predictedHome,
      predictedAway: matchPredictions.predictedAway,
      submittedAt: matchPredictions.submittedAt,
    })
    .from(leagueMemberships)
    .innerJoin(users, eq(leagueMemberships.userId, users.id))
    .leftJoin(
      matchPredictions,
      and(eq(matchPredictions.userId, leagueMemberships.userId), eq(matchPredictions.matchId, matchId)),
    )
    .where(and(eq(leagueMemberships.leagueId, leagueId), eq(leagueMemberships.isActive, true)))
    .orderBy(asc(users.displayName))

  return rows.map((row) => ({
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl ?? null,
    prediction:
      row.predictedHome == null || row.predictedAway == null
        ? null
        : {
            predictedHome: row.predictedHome,
            predictedAway: row.predictedAway,
          },
    submittedAt: row.submittedAt?.toISOString() ?? null,
  }))
}

export async function getLeagueUserMatchPredictions(
  requestingUserId: string,
  leagueId: string,
  targetUserId: string,
): Promise<LeagueUserMatchPredictionDto[]> {
  await assertActiveLeagueMember(requestingUserId, leagueId)
  await assertTargetLeagueMember(leagueId, targetUserId)

  const rows = await db
    .select({
      matchId: matches.id,
      kickoffTime: matches.kickoffTime,
      stage: matches.stage,
      status: matches.status,
      homeTeamId: homeTeams.id,
      homeTeamName: homeTeams.name,
      homeTeamFifaCode: homeTeams.fifaCode,
      homeTeamFlagUrl: homeTeams.flagUrl,
      awayTeamId: awayTeams.id,
      awayTeamName: awayTeams.name,
      awayTeamFifaCode: awayTeams.fifaCode,
      awayTeamFlagUrl: awayTeams.flagUrl,
      predictedHome: matchPredictions.predictedHome,
      predictedAway: matchPredictions.predictedAway,
      submittedAt: matchPredictions.submittedAt,
    })
    .from(matchPredictions)
    .innerJoin(matches, eq(matchPredictions.matchId, matches.id))
    .innerJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .innerJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(eq(matchPredictions.userId, targetUserId))
    .orderBy(matches.kickoffTime, asc(matches.stage))

  return rows.map((row) => ({
    matchId: row.matchId,
    kickoffTime: row.kickoffTime.toISOString(),
    stage: row.stage,
    status: row.status,
    homeTeam: {
      id: row.homeTeamId,
      name: row.homeTeamName,
      fifaCode: row.homeTeamFifaCode,
      flagUrl: row.homeTeamFlagUrl ?? null,
    },
    awayTeam: {
      id: row.awayTeamId,
      name: row.awayTeamName,
      fifaCode: row.awayTeamFifaCode,
      flagUrl: row.awayTeamFlagUrl ?? null,
    },
    prediction:
      row.predictedHome == null || row.predictedAway == null
        ? null
        : {
            predictedHome: row.predictedHome,
            predictedAway: row.predictedAway,
          },
    submittedAt: row.submittedAt?.toISOString() ?? null,
  }))
}

export async function savePredictionsBatch(userId: string, inputs: BatchPredictionInput[]): Promise<BatchPredictionResult> {
  const saved: MatchPrediction[] = []
  const failed: BatchPredictionFailure[] = []

  for (const input of inputs) {
    try {
      await assertPredictionOpen(input.matchId)

      const existing = await getExistingPrediction(userId, input.matchId)
      const prediction = existing
        ? await updatePrediction(userId, input.matchId, input.predictedHome, input.predictedAway)
        : await createPrediction(userId, input.matchId, input.predictedHome, input.predictedAway)

      saved.push(prediction)
    } catch (error) {
      const typedError = error as { message?: string; statusCode?: number }
      failed.push({
        matchId: input.matchId,
        message: typedError.message ?? 'Não foi possível salvar o palpite.',
        statusCode: typedError.statusCode ?? 500,
      })
    }
  }

  return { saved, failed }
}
