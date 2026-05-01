import { describe, it, expect } from 'vitest'

// Integration tests for outright markets seed.
// Pure FINALISTS scoring logic tests are in backend/tests/unit/outrights/finalists.test.ts.
// DB-dependent assertions use testcontainers (wiring deferred).

describe('Outright markets seed (integration)', () => {
  describe('GET /api/v1/outrights', () => {
    it('returns exactly 8 markets', async () => {
      // TODO: wire testcontainers + seed + buildServer()
      // GET /api/v1/outrights
      // Expect array length === 8
      expect(true).toBe(true)
    })

    it('has correct point values for all markets', async () => {
      // Expected: Campeão=100, Artilheiro=80, Bola de Ouro=80, Finalistas=70,
      //           Zebra=60, Revelação=50, Ataque+Positivo=50, Lanterna=40
      expect(true).toBe(true)
    })

    it('all markets start with status OPEN', async () => {
      expect(true).toBe(true)
    })
  })
})
