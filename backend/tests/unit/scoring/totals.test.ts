import { describe, expect, it } from 'vitest'
import { buildUserTotalSnapshot } from '../../../src/scoring/totals.js'

describe('buildUserTotalSnapshot', () => {
  it('combines match and outright points into totalPoints', () => {
    expect(
      buildUserTotalSnapshot({
        matchPoints: 125,
        outrightPoints: 90,
        exactScoreCount: 3,
        winnerGoalDiffCount: 2,
      }),
    ).toEqual({
      totalPoints: 215,
      matchPoints: 125,
      outrightPoints: 90,
      exactScoreCount: 3,
      winnerGoalDiffCount: 2,
    })
  })
})
