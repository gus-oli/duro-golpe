import { describe, expect, it } from 'vitest'
import {
  ANNEX_C_THIRD_PLACE_ALLOCATIONS,
  KNOCKOUT_MATCHES,
  ROUND_OF_32_MATCHES,
  buildResolvedBracket,
  canGenerateBracket,
  getChampion,
  getRoundMatches,
  groupTeamsByLetter,
  isPlaceholderTeam,
  setMatchWinner,
  type GroupLetter,
  type GroupRanking,
  type SimulatorTeam,
} from '../../src/lib/world-cup-simulator'

function buildTeams(): SimulatorTeam[] {
  const groups = 'ABCDEFGHIJKL'.split('') as GroupLetter[]
  return groups.flatMap((group) =>
    [1, 2, 3, 4].map((seed) => ({
      id: `${group}${seed}`,
      name: `Team ${group}${seed}`,
      fifaCode: `${group}${seed}`,
      group,
      flagUrl: null,
    })),
  )
}

function buildRankings(): GroupRanking {
  const groups = 'ABCDEFGHIJKL'.split('') as GroupLetter[]
  return Object.fromEntries(groups.map((group) => [group, [`${group}1`, `${group}2`, `${group}3`, `${group}4`]])) as GroupRanking
}

describe('world cup simulator rules', () => {
  it('encodes the official fixed Round of 32 slots', () => {
    expect(ROUND_OF_32_MATCHES).toHaveLength(16)
    expect(ROUND_OF_32_MATCHES[0]).toMatchObject({
      matchNumber: 73,
      home: { kind: 'groupRank', label: '2A' },
      away: { kind: 'groupRank', label: '2B' },
    })
    expect(ROUND_OF_32_MATCHES.find((match) => match.matchNumber === 74)).toMatchObject({
      home: { kind: 'groupRank', label: '1E' },
      away: { kind: 'thirdPlace', host: '1E' },
    })
  })

  it('contains all Annex C third-place combinations', () => {
    expect(Object.keys(ANNEX_C_THIRD_PLACE_ALLOCATIONS)).toHaveLength(495)
    expect(ANNEX_C_THIRD_PLACE_ALLOCATIONS['ABCDEFGH']).toEqual({
      '1A': 'H',
      '1B': 'G',
      '1D': 'B',
      '1E': 'C',
      '1G': 'A',
      '1I': 'F',
      '1K': 'D',
      '1L': 'E',
    })
  })

  it('generates a bracket using fixed slots and Annex C allocation', () => {
    const teams = buildTeams()
    const rankings = buildRankings()
    const selectedThirds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as GroupLetter[]

    expect(canGenerateBracket(rankings, selectedThirds)).toBe(true)
    const bracket = buildResolvedBracket({ rankings, selectedThirds, teams, winners: {} })
    const match73 = bracket.find((match) => match.matchNumber === 73)
    const match74 = bracket.find((match) => match.matchNumber === 74)

    expect(match73?.home.team?.id).toBe('A2')
    expect(match73?.away.team?.id).toBe('B2')
    expect(match74?.home.team?.id).toBe('E1')
    expect(match74?.away.label).toBe('3C')
    expect(match74?.away.team?.id).toBe('C3')
  })

  it('propagates winners through the official knockout tree', () => {
    const teams = buildTeams()
    const rankings = buildRankings()
    const selectedThirds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as GroupLetter[]
    let winners: Record<number, string> = {}

    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 73, teamId: 'A2' })
    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 75, teamId: 'F1' })
    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 90, teamId: 'A2' })

    const bracket = buildResolvedBracket({ rankings, selectedThirds, teams, winners })
    const quarterfinal = bracket.find((match) => match.matchNumber === 97)

    expect(quarterfinal?.away.team?.id).toBe('A2')
  })

  it('clears downstream winners when an earlier winner changes', () => {
    const teams = buildTeams()
    const rankings = buildRankings()
    const selectedThirds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as GroupLetter[]
    let winners: Record<number, string> = {}

    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 73, teamId: 'A2' })
    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 75, teamId: 'F1' })
    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 90, teamId: 'A2' })
    winners = setMatchWinner({ rankings, selectedThirds, teams, winners, matchNumber: 73, teamId: 'B2' })

    expect(winners[73]).toBe('B2')
    expect(winners[90]).toBeUndefined()
  })

  it('derives final champion and third-place participants from semifinal results', () => {
    const teams = buildTeams()
    const rankings = buildRankings()
    const selectedThirds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as GroupLetter[]
    const winners: Record<number, string> = {}

    for (const match of KNOCKOUT_MATCHES) {
      const bracket = buildResolvedBracket({ rankings, selectedThirds, teams, winners })
      const current = bracket.find((item) => item.matchNumber === match.matchNumber)
      if (current?.home.team) {
        winners[match.matchNumber] = current.home.team.id
      }
    }

    const bracket = buildResolvedBracket({ rankings, selectedThirds, teams, winners })
    expect(getChampion(bracket)?.id).toBeTruthy()
    expect(getRoundMatches(bracket, 'thirdPlace')[0]?.home.team).toBeTruthy()
    expect(getRoundMatches(bracket, 'thirdPlace')[0]?.away.team).toBeTruthy()
  })

  it('groups simulator teams and filters placeholders', () => {
    const grouped = groupTeamsByLetter([
      { id: '1', name: 'Brazil', fifaCode: 'BRA', group: 'A', flagUrl: null },
      { id: '2', name: 'A definir R3201A', fifaCode: 'R3201A', group: 'A', flagUrl: null },
    ])

    expect(isPlaceholderTeam({ name: 'A definir R3201A', fifaCode: 'R3201A' })).toBe(true)
    expect(grouped.A).toHaveLength(1)
  })

  it('rejects invalid third-place selections', () => {
    const rankings = buildRankings()

    expect(canGenerateBracket(rankings, ['A', 'B', 'C'] as GroupLetter[])).toBe(false)
  })
})
