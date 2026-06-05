import {
  createInitialSimulatorState,
  deriveSelectedThirdGroups,
  type GroupRanking,
  type SimulatorState,
} from './world-cup-simulator'

export const SIMULATOR_STORAGE_KEY = 'duro-golpe-world-cup-simulator-v4'

export function isSimulatorState(value: unknown): value is SimulatorState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SimulatorState>
  return (
    candidate.version === 1 &&
    typeof candidate.groupRankings === 'object' &&
    Array.isArray(candidate.selectedThirds) &&
    typeof candidate.winners === 'object' &&
    (candidate.currentStep === 'groups' || candidate.currentStep === 'bracket')
  )
}

export function parseStoredSimulatorState(raw: string | null, defaultRankings: Partial<GroupRanking>): SimulatorState | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isSimulatorState(parsed)) return null

    const groupRankings = {
      ...defaultRankings,
      ...parsed.groupRankings,
    }

    return {
      ...parsed,
      groupRankings,
      selectedThirds: deriveSelectedThirdGroups(groupRankings),
    }
  } catch {
    return null
  }
}

export function createResetSimulatorState(defaultRankings: Partial<GroupRanking>): SimulatorState {
  return {
    ...createInitialSimulatorState(),
    groupRankings: defaultRankings,
  }
}
