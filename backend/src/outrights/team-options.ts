interface TeamRowLike {
  name: string
  fifaCode: string
  apiFootballId: string | null
}

const PLACEHOLDER_PREFIXES = ['R32', 'R16', 'QF', 'SF', '3P', 'FIN', 'KO']

export function isKnockoutPlaceholderTeam(team: TeamRowLike): boolean {
  return (
    team.apiFootballId == null &&
    (team.name.startsWith('A definir ') ||
      PLACEHOLDER_PREFIXES.some((prefix) => team.fifaCode.startsWith(prefix)))
  )
}

export function isSmokeOnlyTeam(team: TeamRowLike): boolean {
  return team.apiFootballId?.startsWith('smoke-team-') ?? false
}

export function filterSelectableOutrightTeams<T extends TeamRowLike>(teams: T[]): T[] {
  const withoutPlaceholders = teams.filter((team) => !isKnockoutPlaceholderTeam(team))
  const nonSmokeTeams = withoutPlaceholders.filter((team) => !isSmokeOnlyTeam(team))

  return nonSmokeTeams.length > 0 ? nonSmokeTeams : withoutPlaceholders
}
