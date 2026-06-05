export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const

export type GroupLetter = (typeof GROUP_LETTERS)[number]
export type GroupRank = 1 | 2 | 3 | 4
export type RoundName = 'round32' | 'round16' | 'quarterfinal' | 'semifinal' | 'thirdPlace' | 'final'
export type ThirdPlaceHostSlot = '1A' | '1B' | '1D' | '1E' | '1G' | '1I' | '1K' | '1L'

export interface SimulatorTeam {
  id: string
  name: string
  fifaCode: string
  group: GroupLetter
  flagUrl: string | null
}

export type GroupRanking = Record<GroupLetter, string[]>
export type ThirdPlaceSelection = GroupLetter[]

export interface SimulatorState {
  version: 1
  groupRankings: Partial<GroupRanking>
  selectedThirds: GroupLetter[]
  winners: Record<number, string>
  currentStep: 'groups' | 'bracket'
}

export type SlotKind = 'groupRank' | 'thirdPlace' | 'winner' | 'loser'

export interface GroupRankSlot {
  kind: 'groupRank'
  group: GroupLetter
  rank: 1 | 2
  label: string
}

export interface ThirdPlaceSlot {
  kind: 'thirdPlace'
  host: ThirdPlaceHostSlot
  candidateGroups: GroupLetter[]
  label: string
}

export interface WinnerSlot {
  kind: 'winner'
  matchNumber: number
  label: string
}

export interface LoserSlot {
  kind: 'loser'
  matchNumber: 101 | 102
  label: string
}

export type KnockoutSlot = GroupRankSlot | ThirdPlaceSlot | WinnerSlot | LoserSlot

export interface KnockoutMatchDefinition {
  matchNumber: number
  round: RoundName
  home: KnockoutSlot
  away: KnockoutSlot
}

export interface ResolvedSlot {
  label: string
  team: SimulatorTeam | null
}

export interface ResolvedKnockoutMatch {
  matchNumber: number
  round: RoundName
  home: ResolvedSlot
  away: ResolvedSlot
  winner: SimulatorTeam | null
}
