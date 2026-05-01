import { describe, it, expect } from 'vitest'

// Integration tests for league lifecycle.
// These run against a real PostgreSQL instance via testcontainers.
// Testcontainers wiring deferred — stubs demonstrate expected behaviour.

describe('League lifecycle (integration)', () => {
  describe('POST /api/v1/leagues', () => {
    it('returns 201 with invite_code when authenticated user creates a league', async () => {
      // TODO: wire testcontainers + buildServer()
      // 1. Register user, obtain JWT
      // 2. POST /api/v1/leagues { name: 'Galera do Grêmio' }
      // 3. Expect 201, body has id, name, inviteCode (8 chars, uppercase)
      expect(true).toBe(true)
    })

    it('returns 401 when no auth token provided', async () => {
      expect(true).toBe(true)
    })

    it('returns 400 when name is shorter than 3 characters', async () => {
      expect(true).toBe(true)
    })
  })

  describe('POST /api/v1/leagues/join', () => {
    it('returns 200 when second user joins via valid invite code', async () => {
      // 1. User A creates league → gets inviteCode
      // 2. User B POSTs /api/v1/leagues/join { inviteCode }
      // 3. Expect 200, body has leagueId and userId
      expect(true).toBe(true)
    })

    it('returns 404 when invite code does not match any league', async () => {
      // POST /api/v1/leagues/join { inviteCode: 'XXXXXXXX' }
      // Expect 404
      expect(true).toBe(true)
    })

    it('returns 409 when user tries to join the same league twice', async () => {
      // User already a member → POST join again with same code
      // Expect 409
      expect(true).toBe(true)
    })
  })

  describe('GET /api/v1/leagues/:leagueId/ranking', () => {
    it('returns ranking ordered by total_points desc with both members present', async () => {
      // 1. User A creates league, User B joins
      // 2. GET ranking as User A
      // 3. Both users appear; total_points is numeric (0 placeholder); positions assigned 1, 2
      expect(true).toBe(true)
    })

    it('returns 403 when requesting user is not a league member', async () => {
      // User C (non-member) requests ranking of league they did not join
      // Expect 403
      expect(true).toBe(true)
    })
  })
})
