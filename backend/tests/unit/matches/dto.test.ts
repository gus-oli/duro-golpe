import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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
      socialOdds: null,
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
      socialOdds: null,
    })
  })

  it('includes social odds when provided by the match service projection', () => {
    expect(
      buildMatchListItemDto({
        ...projection,
        socialOdds: {
          status: 'AVAILABLE',
          source: 'FROZEN',
          totalPredictions: 10,
          minimumSample: 1,
          underdogThresholdBps: 3000,
          underdogThresholdPercentage: 30,
          capturedAt: '2026-06-15T12:00:00.000Z',
          outcomes: [
            { outcome: 'HOME_WIN', count: 7, basisPoints: 7000, percentage: 70 },
            { outcome: 'DRAW', count: 1, basisPoints: 1000, percentage: 10 },
            { outcome: 'AWAY_WIN', count: 2, basisPoints: 2000, percentage: 20 },
          ],
        },
      }).socialOdds,
    ).toMatchObject({
      status: 'AVAILABLE',
      source: 'FROZEN',
      totalPredictions: 10,
    })
  })

  it('localizes provider team names in match DTOs', () => {
    const dto = buildMatchListItemDto({
      ...projection,
      awayTeam: {
        id: 'team-away',
        name: 'France',
        fifaCode: 'FRA',
        flagUrl: null,
      },
    })

    expect(dto.awayTeam.name).toBe('França')
  })
})
