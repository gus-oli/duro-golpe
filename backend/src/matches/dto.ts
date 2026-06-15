import type { Match } from '../db/schema/matches.js'
import { getEffectiveMatchStatus } from './lock-utils.js'
import type { SocialOddsView } from './social-odds.js'
import { localizeTeamName } from '../seeds/team-localization.js'

interface MatchTeamDto {
  id: string
  name: string
  fifaCode: string
  flagUrl: string | null
}

interface MatchPredictionDto {
  predictedHome: number | null
  predictedAway: number | null
}

export interface MatchProjection {
  id: string
  kickoffTime: Date
  stage: string
  venue: string | null
  status: Match['status']
  homeScore: number | null
  awayScore: number | null
  homeTeam: MatchTeamDto
  awayTeam: MatchTeamDto
  prediction: MatchPredictionDto | null
  socialOdds?: SocialOddsView | null
}

export interface MatchListItemDto {
  id: string
  kickoffTime: string
  stage: string
  venue: string | null
  status: Match['status']
  homeScore: number | null
  awayScore: number | null
  homeTeam: MatchTeamDto
  awayTeam: MatchTeamDto
  userPrediction: { predictedHome: number; predictedAway: number } | null
  socialOdds: SocialOddsView | null
}

export interface MatchDetailDto extends MatchListItemDto {
  currentScore?: { home: number; away: number }
}

function buildUserPrediction(prediction: MatchPredictionDto | null): MatchListItemDto['userPrediction'] {
  if (!prediction || prediction.predictedHome === null || prediction.predictedAway === null) {
    return null
  }

  return {
    predictedHome: prediction.predictedHome,
    predictedAway: prediction.predictedAway,
  }
}

function buildTeamDto(team: MatchTeamDto): MatchTeamDto {
  return {
    ...team,
    name: localizeTeamName(team.fifaCode, team.name),
  }
}

export function buildMatchListItemDto(projection: MatchProjection): MatchListItemDto {
  const status = getEffectiveMatchStatus(projection.status, projection.kickoffTime)

  return {
    id: projection.id,
    kickoffTime: projection.kickoffTime.toISOString(),
    stage: projection.stage,
    venue: projection.venue,
    status,
    homeScore: projection.homeScore,
    awayScore: projection.awayScore,
    homeTeam: buildTeamDto(projection.homeTeam),
    awayTeam: buildTeamDto(projection.awayTeam),
    userPrediction: buildUserPrediction(projection.prediction),
    socialOdds: projection.socialOdds ?? null,
  }
}

export function buildMatchDetailDto(projection: MatchProjection): MatchDetailDto {
  const dto: MatchDetailDto = buildMatchListItemDto(projection)

  if (
    (projection.status === 'LIVE' || projection.status === 'FINISHED') &&
    projection.homeScore !== null &&
    projection.awayScore !== null
  ) {
    dto.currentScore = {
      home: projection.homeScore,
      away: projection.awayScore,
    }
  }

  return dto
}
