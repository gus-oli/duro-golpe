import { describe, expect, it } from 'vitest'
import {
  createResetSimulatorState,
  isSimulatorState,
  parseStoredSimulatorState,
} from '../../src/lib/world-cup-simulator-storage'
import type { GroupRanking } from '../../src/lib/world-cup-simulator'

const defaultRankings: Partial<GroupRanking> = {
  A: ['A1', 'A2', 'A3', 'A4'],
  B: ['B1', 'B2', 'B3', 'B4'],
}

describe('world cup simulator local state', () => {
  it('restores compatible saved state and merges default rankings', () => {
    const stored = JSON.stringify({
      version: 1,
      groupRankings: { A: ['A4', 'A3', 'A2', 'A1'] },
      selectedThirds: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      winners: { 73: 'A4' },
      currentStep: 'bracket',
    })

    const restored = parseStoredSimulatorState(stored, defaultRankings)

    expect(restored?.groupRankings.A).toEqual(['A4', 'A3', 'A2', 'A1'])
    expect(restored?.groupRankings.B).toEqual(['B1', 'B2', 'B3', 'B4'])
    expect(restored?.currentStep).toBe('bracket')
    expect(restored?.winners[73]).toBe('A4')
  })

  it('rejects incompatible saved state', () => {
    expect(parseStoredSimulatorState('not-json', defaultRankings)).toBeNull()
    expect(isSimulatorState({ version: 2 })).toBe(false)
  })

  it('creates reset state with defaults and no selected bracket path', () => {
    const reset = createResetSimulatorState(defaultRankings)

    expect(reset.version).toBe(1)
    expect(reset.groupRankings).toEqual(defaultRankings)
    expect(reset.selectedThirds).toEqual([])
    expect(reset.winners).toEqual({})
    expect(reset.currentStep).toBe('groups')
  })
})
