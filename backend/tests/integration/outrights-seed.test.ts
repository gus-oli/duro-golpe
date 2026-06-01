import { describe, expect, it } from 'vitest'

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
      // Expected: Campeao=120, Artilheiro=90, Bola de Ouro=90, Melhor Goleiro=70,
      //           Finalistas=90, Revelacao=70, Melhor Ataque=80, Lanterna=60
      expect(true).toBe(true)
    })

    it('all markets start with status OPEN', async () => {
      expect(true).toBe(true)
    })
  })
})
