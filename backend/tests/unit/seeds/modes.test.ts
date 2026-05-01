import { describe, expect, it } from 'vitest'
import { buildDemoMatches, DEMO_OUTRIGHT_MARKETS, DEMO_TEAMS, DEMO_USERS } from '../../../src/seeds/demo-dataset.js'
import { buildSmokeMatches, SMOKE_TEAMS } from '../../../src/seeds/smoke-dataset.js'

describe('seed mode datasets', () => {
  it('keeps smoke mode intentionally minimal', () => {
    const smokeMatches = buildSmokeMatches(new Date('2026-05-01T12:00:00.000Z'))

    expect(SMOKE_TEAMS).toHaveLength(2)
    expect(smokeMatches).toHaveLength(1)
    expect(smokeMatches[0]?.stage).toBe('Smoke Test')
  })

  it('covers the main demo product surfaces', () => {
    const demoMatches = buildDemoMatches()

    expect(DEMO_TEAMS.length).toBeGreaterThanOrEqual(8)
    expect(DEMO_USERS.length).toBeGreaterThanOrEqual(4)
    expect(new Set(demoMatches.map((match) => match.status))).toEqual(
      new Set(['SCHEDULED', 'LOCKED', 'LIVE', 'FINISHED']),
    )
    expect(new Set(DEMO_OUTRIGHT_MARKETS.map((market) => market.status))).toEqual(
      new Set(['OPEN', 'LOCKED', 'RESOLVED']),
    )
  })
})
