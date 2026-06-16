export type RankingMovement = 'up' | 'down' | 'same' | 'new'

export interface RankingMovementEntry {
  userId: string
  displayName: string
  totalPoints: number
  exactScoreCount: number
  winnerGoalDiffCount: number
  position: number
  joinedAt?: Date | null
}

export interface RankingScoreImpact {
  userId: string
  points: number
  exactScoreCount: number
  winnerGoalDiffCount: number
}

export interface RankingMovementContext {
  scoredAt: Date | string | number
  scoreImpacts: RankingScoreImpact[]
}

export interface RankingMovementFields {
  previousPosition: number | null
  positionDelta: number
  movement: RankingMovement
}

function compareRankingEntries(
  a: Pick<RankingMovementEntry, 'displayName' | 'totalPoints' | 'exactScoreCount' | 'winnerGoalDiffCount'>,
  b: Pick<RankingMovementEntry, 'displayName' | 'totalPoints' | 'exactScoreCount' | 'winnerGoalDiffCount'>,
) {
  if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints
  if (a.exactScoreCount !== b.exactScoreCount) return b.exactScoreCount - a.exactScoreCount
  if (a.winnerGoalDiffCount !== b.winnerGoalDiffCount) {
    return b.winnerGoalDiffCount - a.winnerGoalDiffCount
  }
  return a.displayName.localeCompare(b.displayName)
}

function withoutMovementContext<T extends RankingMovementEntry>(entries: readonly T[]): Array<T & RankingMovementFields> {
  return entries.map((entry) => ({
    ...entry,
    previousPosition: null,
    positionDelta: 0,
    movement: 'same',
  }))
}

export function appendRankingMovement<T extends RankingMovementEntry>(
  entries: readonly T[],
  context: RankingMovementContext | null,
): Array<T & RankingMovementFields> {
  if (!context) return withoutMovementContext(entries)

  const impactsByUser = new Map(context.scoreImpacts.map((impact) => [impact.userId, impact]))
  const scoredAtMs = context.scoredAt instanceof Date ? context.scoredAt.getTime() : new Date(context.scoredAt).getTime()
  if (Number.isNaN(scoredAtMs)) return withoutMovementContext(entries)

  const previousEntries = entries
    .filter((entry) => !entry.joinedAt || entry.joinedAt.getTime() <= scoredAtMs)
    .map((entry) => {
      const impact = impactsByUser.get(entry.userId)
      return {
        userId: entry.userId,
        displayName: entry.displayName,
        totalPoints: Math.max(0, entry.totalPoints - (impact?.points ?? 0)),
        exactScoreCount: Math.max(0, entry.exactScoreCount - (impact?.exactScoreCount ?? 0)),
        winnerGoalDiffCount: Math.max(0, entry.winnerGoalDiffCount - (impact?.winnerGoalDiffCount ?? 0)),
      }
    })
    .sort(compareRankingEntries)

  if (previousEntries.length === 0) return withoutMovementContext(entries)

  const previousPositions = new Map(previousEntries.map((entry, index) => [entry.userId, index + 1]))

  return entries.map((entry) => {
    const previousPosition = previousPositions.get(entry.userId) ?? null
    if (previousPosition == null) {
      return {
        ...entry,
        previousPosition,
        positionDelta: 0,
        movement: 'new',
      }
    }

    const positionDelta = previousPosition - entry.position
    const movement = positionDelta > 0 ? 'up' : positionDelta < 0 ? 'down' : 'same'

    return {
      ...entry,
      previousPosition,
      positionDelta,
      movement,
    }
  })
}
