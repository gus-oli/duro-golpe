import { describe, expect, it } from 'vitest'
import { buildMatchDetailDto, buildMatchListItemDto } from '../../../src/matches/dto.js'

const kickoffTime = new Date('2026-06-11T18:00:00.000Z')

const projection = {
  id: 'match-1',
  kickoffTime,
  stage: 'GROUP',
  venue: 'Estadio Azteca',
  status: 'SCHEDULED' as const,
  homeScore: null,
  awayScore: null,
  homeTeam: {
    id: 'team-home',
    name: 'Brasil',
    fifaCode: 'BRA',
    flagUrl: 'https://flags.test/bra.png',
  },
  awayTeam: {
    id: 'team-away',
    name: 'Argentina',
    fifaCode: 'ARG',
    flagUrl: 'https://flags.test/arg.png',
  },
  prediction: {
    predictedHome: 2,
    predictedAway: 1,
  },
}

describe('match DTO builders', () => {
  it('builds the list item shape expected by the web UI', () => {
    expect(buildMatchListItemDto(projection)).toEqual({
      id: 'match-1',
      kickoffTime: kickoffTime.toISOString(),
      stage: 'GROUP',
      venue: 'Estadio Azteca',
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
      homeTeam: projection.homeTeam,
      awayTeam: projection.awayTeam,
      userPrediction: {
        predictedHome: 2,
        predictedAway: 1,
      },
    })
  })

  it('builds the detail shape with currentScore for live or finished matches', () => {
    expect(
      buildMatchDetailDto({
        ...projection,
        status: 'LIVE',
        homeScore: 1,
        awayScore: 0,
      }),
    ).toEqual({
      id: 'match-1',
      kickoffTime: kickoffTime.toISOString(),
      stage: 'GROUP',
      venue: 'Estadio Azteca',
      status: 'LIVE',
      homeScore: 1,
      awayScore: 0,
      currentScore: { home: 1, away: 0 },
      homeTeam: projection.homeTeam,
      awayTeam: projection.awayTeam,
      userPrediction: {
        predictedHome: 2,
        predictedAway: 1,
      },
    })
  })
})
