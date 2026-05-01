export const TOURNAMENT_YEAR = 2026
export const TOURNAMENT_TEAM_COUNT = 48
export const TOURNAMENT_MATCH_COUNT = 104

interface TournamentCountInput {
  teamCount: number
  matchCount: number
}

export function validateTournamentCounts({ teamCount, matchCount }: TournamentCountInput): void {
  if (teamCount !== TOURNAMENT_TEAM_COUNT) {
    throw new Error(
      `Expected ${TOURNAMENT_TEAM_COUNT} teams for World Cup ${TOURNAMENT_YEAR}, received ${teamCount}.`,
    )
  }

  if (matchCount !== TOURNAMENT_MATCH_COUNT) {
    throw new Error(
      `Expected ${TOURNAMENT_MATCH_COUNT} matches for World Cup ${TOURNAMENT_YEAR}, received ${matchCount}.`,
    )
  }
}
