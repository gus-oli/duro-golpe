import type { SeedMatchInput, SeedTeamInput } from './support.js'
import { createSeedFlagDataUri } from './visuals.js'

export const SMOKE_TEAMS: SeedTeamInput[] = [
  {
    key: 'BRA',
    apiFootballId: 'smoke-team-bra',
    name: 'Brazil',
    fifaCode: 'BRA',
    flagUrl: createSeedFlagDataUri('BRA', '#0b6a3b', '#f4d64e', '#1b4fd6'),
  },
  {
    key: 'FRA',
    apiFootballId: 'smoke-team-fra',
    name: 'France',
    fifaCode: 'FRA',
    flagUrl: createSeedFlagDataUri('FRA', '#1a47b8', '#ffffff', '#d62839'),
  },
] as const

export function buildSmokeMatches(anchorTime = new Date()): SeedMatchInput[] {
  return [
    {
      apiFootballId: '900001',
      homeTeamKey: 'BRA',
      awayTeamKey: 'FRA',
      kickoffTime: new Date(anchorTime.getTime() + 48 * 60 * 60 * 1000),
      stage: 'Smoke Test',
      venue: 'Arena Smoke',
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null,
    },
  ]
}
