import { describe, expect, it } from 'vitest'
import { appendRankingMovement, type RankingMovementEntry } from '../../../src/leagues/ranking-movement.js'

function entry(overrides: Partial<RankingMovementEntry> & Pick<RankingMovementEntry, 'userId' | 'displayName' | 'position'>): RankingMovementEntry {
  return {
    totalPoints: 0,
    exactScoreCount: 0,
    winnerGoalDiffCount: 0,
    joinedAt: new Date('2026-06-01T12:00:00.000Z'),
    ...overrides,
  }
}

describe('appendRankingMovement', () => {
  it('compares the current ranking with the table before the latest scored match', () => {
    const ranking = appendRankingMovement(
      [
        entry({ userId: 'user-b', displayName: 'Bruno', totalPoints: 110, position: 1 }),
        entry({ userId: 'user-a', displayName: 'Ana', totalPoints: 100, position: 2 }),
      ],
      {
        scoredAt: '2026-06-15T21:00:00.000Z',
        scoreImpacts: [{ userId: 'user-b', points: 20, exactScoreCount: 0, winnerGoalDiffCount: 0 }],
      },
    )

    expect(ranking[0]).toMatchObject({ userId: 'user-b', previousPosition: 2, positionDelta: 1, movement: 'up' })
    expect(ranking[1]).toMatchObject({ userId: 'user-a', previousPosition: 1, positionDelta: -1, movement: 'down' })
  })

  it('uses the same tiebreakers when rebuilding the previous table', () => {
    const ranking = appendRankingMovement(
      [
        entry({ userId: 'user-b', displayName: 'Bruno', totalPoints: 50, exactScoreCount: 2, position: 1 }),
        entry({ userId: 'user-a', displayName: 'Ana', totalPoints: 50, exactScoreCount: 1, position: 2 }),
      ],
      {
        scoredAt: new Date('2026-06-15T21:00:00.000Z'),
        scoreImpacts: [{ userId: 'user-b', points: 0, exactScoreCount: 1, winnerGoalDiffCount: 0 }],
      },
    )

    expect(ranking[0]).toMatchObject({ userId: 'user-b', previousPosition: 2, positionDelta: 1, movement: 'up' })
    expect(ranking[1]).toMatchObject({ userId: 'user-a', previousPosition: 1, positionDelta: -1, movement: 'down' })
  })

  it('returns neutral movement when no scored match context exists', () => {
    const ranking = appendRankingMovement([entry({ userId: 'user-a', displayName: 'Ana', position: 1 })], null)

    expect(ranking[0]).toMatchObject({ previousPosition: null, positionDelta: 0, movement: 'same' })
  })

  it('marks users that joined after the latest scored match as new', () => {
    const ranking = appendRankingMovement(
      [
        entry({
          userId: 'user-b',
          displayName: 'Bruno',
          totalPoints: 100,
          position: 1,
          joinedAt: new Date('2026-06-16T12:00:00.000Z'),
        }),
        entry({ userId: 'user-a', displayName: 'Ana', totalPoints: 50, position: 2 }),
      ],
      {
        scoredAt: new Date('2026-06-15T21:00:00.000Z'),
        scoreImpacts: [],
      },
    )

    expect(ranking[0]).toMatchObject({ userId: 'user-b', previousPosition: null, positionDelta: 0, movement: 'new' })
    expect(ranking[1]).toMatchObject({ userId: 'user-a', previousPosition: 1, positionDelta: -1, movement: 'down' })
  })
})
