import {
  ANNEX_C_SOURCE,
  ANNEX_C_THIRD_PLACE_ALLOCATIONS,
} from './world-cup-annex-c'
import {
  GROUP_LETTERS,
  type GroupLetter,
  type GroupRanking,
  type KnockoutMatchDefinition,
  type KnockoutSlot,
  type ResolvedKnockoutMatch,
  type ResolvedSlot,
  type RoundName,
  type SimulatorState,
  type SimulatorTeam,
  type ThirdPlaceHostSlot,
} from './world-cup-simulator-types'

export { ANNEX_C_SOURCE, ANNEX_C_THIRD_PLACE_ALLOCATIONS, GROUP_LETTERS }
export type {
  GroupLetter,
  GroupRanking,
  KnockoutMatchDefinition,
  ResolvedKnockoutMatch,
  RoundName,
  SimulatorState,
  SimulatorTeam,
  ThirdPlaceHostSlot,
}

const THIRD_PLACE_HOST_TO_MATCH: Record<ThirdPlaceHostSlot, number> = {
  '1A': 79,
  '1B': 85,
  '1D': 81,
  '1E': 74,
  '1G': 82,
  '1I': 77,
  '1K': 87,
  '1L': 80,
}

function groupRank(group: GroupLetter, rank: 1 | 2): KnockoutSlot {
  return {
    kind: 'groupRank',
    group,
    rank,
    label: `${rank}${group}`,
  }
}

function thirdPlace(host: ThirdPlaceHostSlot, candidateGroups: GroupLetter[]): KnockoutSlot {
  return {
    kind: 'thirdPlace',
    host,
    candidateGroups,
    label: `3${candidateGroups.join('/')}`,
  }
}

function winner(matchNumber: number): KnockoutSlot {
  return {
    kind: 'winner',
    matchNumber,
    label: `W${matchNumber}`,
  }
}

function loser(matchNumber: 101 | 102): KnockoutSlot {
  return {
    kind: 'loser',
    matchNumber,
    label: `L${matchNumber}`,
  }
}

export const ROUND_OF_32_MATCHES: KnockoutMatchDefinition[] = [
  { matchNumber: 73, round: 'round32', home: groupRank('A', 2), away: groupRank('B', 2) },
  { matchNumber: 74, round: 'round32', home: groupRank('E', 1), away: thirdPlace('1E', ['A', 'B', 'C', 'D', 'F']) },
  { matchNumber: 75, round: 'round32', home: groupRank('F', 1), away: groupRank('C', 2) },
  { matchNumber: 76, round: 'round32', home: groupRank('C', 1), away: groupRank('F', 2) },
  { matchNumber: 77, round: 'round32', home: groupRank('I', 1), away: thirdPlace('1I', ['C', 'D', 'F', 'G', 'H']) },
  { matchNumber: 78, round: 'round32', home: groupRank('E', 2), away: groupRank('I', 2) },
  { matchNumber: 79, round: 'round32', home: groupRank('A', 1), away: thirdPlace('1A', ['C', 'E', 'F', 'H', 'I']) },
  { matchNumber: 80, round: 'round32', home: groupRank('L', 1), away: thirdPlace('1L', ['E', 'H', 'I', 'J', 'K']) },
  { matchNumber: 81, round: 'round32', home: groupRank('D', 1), away: thirdPlace('1D', ['B', 'E', 'F', 'I', 'J']) },
  { matchNumber: 82, round: 'round32', home: groupRank('G', 1), away: thirdPlace('1G', ['A', 'E', 'H', 'I', 'J']) },
  { matchNumber: 83, round: 'round32', home: groupRank('K', 2), away: groupRank('L', 2) },
  { matchNumber: 84, round: 'round32', home: groupRank('H', 1), away: groupRank('J', 2) },
  { matchNumber: 85, round: 'round32', home: groupRank('B', 1), away: thirdPlace('1B', ['E', 'F', 'G', 'I', 'J']) },
  { matchNumber: 86, round: 'round32', home: groupRank('J', 1), away: groupRank('H', 2) },
  { matchNumber: 87, round: 'round32', home: groupRank('K', 1), away: thirdPlace('1K', ['D', 'E', 'I', 'J', 'L']) },
  { matchNumber: 88, round: 'round32', home: groupRank('D', 2), away: groupRank('G', 2) },
]

export const KNOCKOUT_TREE_MATCHES: KnockoutMatchDefinition[] = [
  { matchNumber: 89, round: 'round16', home: winner(74), away: winner(77) },
  { matchNumber: 90, round: 'round16', home: winner(73), away: winner(75) },
  { matchNumber: 91, round: 'round16', home: winner(76), away: winner(78) },
  { matchNumber: 92, round: 'round16', home: winner(79), away: winner(80) },
  { matchNumber: 93, round: 'round16', home: winner(83), away: winner(84) },
  { matchNumber: 94, round: 'round16', home: winner(81), away: winner(82) },
  { matchNumber: 95, round: 'round16', home: winner(86), away: winner(88) },
  { matchNumber: 96, round: 'round16', home: winner(85), away: winner(87) },
  { matchNumber: 97, round: 'quarterfinal', home: winner(89), away: winner(90) },
  { matchNumber: 98, round: 'quarterfinal', home: winner(93), away: winner(94) },
  { matchNumber: 99, round: 'quarterfinal', home: winner(91), away: winner(92) },
  { matchNumber: 100, round: 'quarterfinal', home: winner(95), away: winner(96) },
  { matchNumber: 101, round: 'semifinal', home: winner(97), away: winner(98) },
  { matchNumber: 102, round: 'semifinal', home: winner(99), away: winner(100) },
  { matchNumber: 103, round: 'thirdPlace', home: loser(101), away: loser(102) },
  { matchNumber: 104, round: 'final', home: winner(101), away: winner(102) },
]

export const KNOCKOUT_MATCHES: KnockoutMatchDefinition[] = [
  ...ROUND_OF_32_MATCHES,
  ...KNOCKOUT_TREE_MATCHES,
]

export const ROUND_LABELS: Record<RoundName, string> = {
  round32: 'Round of 32',
  round16: 'Oitavas',
  quarterfinal: 'Quartas',
  semifinal: 'Semifinais',
  thirdPlace: 'Terceiro lugar',
  final: 'Final',
}

export const EMPTY_SIMULATOR_STATE: SimulatorState = {
  version: 1,
  groupRankings: {},
  selectedThirds: [],
  winners: {},
  currentStep: 'groups',
}

export function createInitialSimulatorState(): SimulatorState {
  return {
    version: 1,
    groupRankings: {},
    selectedThirds: [],
    winners: {},
    currentStep: 'groups',
  }
}

export function getTeamFallback(team: Pick<SimulatorTeam, 'fifaCode' | 'name'>): string {
  return (team.fifaCode || team.name.slice(0, 3)).toUpperCase()
}

export function isPlaceholderTeam(team: Pick<SimulatorTeam, 'name' | 'fifaCode'>): boolean {
  return (
    team.name.startsWith('A definir ') ||
    /^(R32|R16|QF|SF|3P|FIN|KO)\d{2}[AB]$/.test(team.fifaCode)
  )
}

export function groupTeamsByLetter(teams: SimulatorTeam[]): Record<GroupLetter, SimulatorTeam[]> {
  const groups = {} as Record<GroupLetter, SimulatorTeam[]>
  for (const group of GROUP_LETTERS) {
    groups[group] = []
  }

  for (const team of teams) {
    if (!isPlaceholderTeam(team)) {
      groups[team.group].push(team)
    }
  }

  for (const group of GROUP_LETTERS) {
    groups[group] = [...groups[group]].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
  }

  return groups
}

export function createDefaultRankings(groupedTeams: Record<GroupLetter, SimulatorTeam[]>): Partial<GroupRanking> {
  const rankings: Partial<GroupRanking> = {}
  for (const group of GROUP_LETTERS) {
    const teams = groupedTeams[group]
    if (teams.length === 4) {
      rankings[group] = []
    }
  }
  return rankings
}

export function hasCompleteGroups(groupedTeams: Record<GroupLetter, SimulatorTeam[]>): boolean {
  return GROUP_LETTERS.every((group) => groupedTeams[group].length === 4)
}

export function isCompleteGroupRanking(rankings: Partial<GroupRanking>): rankings is GroupRanking {
  return GROUP_LETTERS.every((group) => {
    const ids = rankings[group]
    if (!ids?.[0] || !ids[1]) return false
    const selectedIds = ids.filter(Boolean)
    return new Set(selectedIds).size === selectedIds.length
  })
}

export function getThirdPlaceKey(groups: GroupLetter[]): string {
  return [...groups].sort().join('')
}

export function getThirdPlaceAllocation(
  selectedThirds: GroupLetter[],
): Record<ThirdPlaceHostSlot, GroupLetter> | null {
  if (selectedThirds.length !== 8) return null
  const key = getThirdPlaceKey(selectedThirds)
  return ANNEX_C_THIRD_PLACE_ALLOCATIONS[key] ?? null
}

export function canGenerateBracket(rankings: Partial<GroupRanking>, selectedThirds: GroupLetter[]): boolean {
  return (
    isCompleteGroupRanking(rankings) &&
    selectedThirds.every((group) => Boolean(rankings[group]?.[2])) &&
    getThirdPlaceAllocation(selectedThirds) != null
  )
}

export function deriveSelectedThirdGroups(rankings: Partial<GroupRanking>): GroupLetter[] {
  return GROUP_LETTERS.filter((group) => Boolean(rankings[group]?.[2]))
}

function findTeam(teamsById: Map<string, SimulatorTeam>, teamId: string | undefined): SimulatorTeam | null {
  return teamId ? teamsById.get(teamId) ?? null : null
}

function getMatch(matches: ResolvedKnockoutMatch[], matchNumber: number): ResolvedKnockoutMatch | null {
  return matches.find((match) => match.matchNumber === matchNumber) ?? null
}

function getMatchWinner(matches: ResolvedKnockoutMatch[], matchNumber: number): SimulatorTeam | null {
  return getMatch(matches, matchNumber)?.winner ?? null
}

function getMatchLoser(matches: ResolvedKnockoutMatch[], matchNumber: 101 | 102): SimulatorTeam | null {
  const match = getMatch(matches, matchNumber)
  if (!match?.winner || !match.home.team || !match.away.team) return null
  return match.home.team.id === match.winner.id ? match.away.team : match.home.team
}

function resolveSlot(
  slot: KnockoutSlot,
  rankings: GroupRanking,
  selectedThirds: GroupLetter[],
  teamsById: Map<string, SimulatorTeam>,
  matches: ResolvedKnockoutMatch[],
): ResolvedSlot {
  if (slot.kind === 'groupRank') {
    return {
      label: slot.label,
      team: findTeam(teamsById, rankings[slot.group]?.[slot.rank - 1]),
    }
  }

  if (slot.kind === 'thirdPlace') {
    const allocation = getThirdPlaceAllocation(selectedThirds)
    const group = allocation?.[slot.host]
    return {
      label: group ? `3${group}` : slot.label,
      team: group ? findTeam(teamsById, rankings[group]?.[2]) : null,
    }
  }

  if (slot.kind === 'winner') {
    return {
      label: slot.label,
      team: getMatchWinner(matches, slot.matchNumber),
    }
  }

  return {
    label: slot.label,
    team: getMatchLoser(matches, slot.matchNumber),
  }
}

export function buildResolvedBracket({
  rankings,
  selectedThirds,
  teams,
  winners,
}: {
  rankings: GroupRanking
  selectedThirds: GroupLetter[]
  teams: SimulatorTeam[]
  winners: Record<number, string>
}): ResolvedKnockoutMatch[] {
  const teamsById = new Map(teams.map((team) => [team.id, team]))
  const matches: ResolvedKnockoutMatch[] = []

  for (const definition of KNOCKOUT_MATCHES) {
    const home = resolveSlot(definition.home, rankings, selectedThirds, teamsById, matches)
    const away = resolveSlot(definition.away, rankings, selectedThirds, teamsById, matches)
    const selectedWinnerId = winners[definition.matchNumber]
    const winnerTeam =
      selectedWinnerId && (home.team?.id === selectedWinnerId || away.team?.id === selectedWinnerId)
        ? findTeam(teamsById, selectedWinnerId)
        : null

    matches.push({
      matchNumber: definition.matchNumber,
      round: definition.round,
      home,
      away,
      winner: winnerTeam,
    })
  }

  return matches
}

export function sanitizeWinners({
  rankings,
  selectedThirds,
  teams,
  winners,
}: {
  rankings: GroupRanking
  selectedThirds: GroupLetter[]
  teams: SimulatorTeam[]
  winners: Record<number, string>
}): Record<number, string> {
  let current = { ...winners }
  let changed = true

  while (changed) {
    changed = false
    const bracket = buildResolvedBracket({ rankings, selectedThirds, teams, winners: current })

    for (const match of bracket) {
      const selectedWinner = current[match.matchNumber]
      if (!selectedWinner) continue

      if (match.home.team?.id !== selectedWinner && match.away.team?.id !== selectedWinner) {
        const next = { ...current }
        delete next[match.matchNumber]
        current = next
        changed = true
        break
      }
    }
  }

  return current
}

export function setMatchWinner({
  rankings,
  selectedThirds,
  teams,
  winners,
  matchNumber,
  teamId,
}: {
  rankings: GroupRanking
  selectedThirds: GroupLetter[]
  teams: SimulatorTeam[]
  winners: Record<number, string>
  matchNumber: number
  teamId: string
}): Record<number, string> {
  return sanitizeWinners({
    rankings,
    selectedThirds,
    teams,
    winners: {
      ...winners,
      [matchNumber]: teamId,
    },
  })
}

export function getChampion(bracket: ResolvedKnockoutMatch[]): SimulatorTeam | null {
  return getMatchWinner(bracket, 104)
}

export function getRoundMatches(bracket: ResolvedKnockoutMatch[], round: RoundName): ResolvedKnockoutMatch[] {
  return bracket.filter((match) => match.round === round)
}

export function getThirdPlaceHostMatch(host: ThirdPlaceHostSlot): number {
  return THIRD_PLACE_HOST_TO_MATCH[host]
}
