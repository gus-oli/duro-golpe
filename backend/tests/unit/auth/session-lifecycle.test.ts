import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  sessionVersion: undefined as number | undefined,
}))

vi.mock('../../../src/db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: () => ({
        where: () => ({
          limit: async () =>
            state.sessionVersion == null ? [] : [{ sessionVersion: state.sessionVersion }],
        }),
      }),
    })),
  },
}))

import { isSessionPayloadCurrent } from '../../../src/auth/session-lifecycle.js'

describe('isSessionPayloadCurrent', () => {
  beforeEach(() => {
    process.env['AUTH_ENFORCE_SESSION_VERSION'] = 'true'
    state.sessionVersion = undefined
  })

  afterEach(() => {
    delete process.env['AUTH_ENFORCE_SESSION_VERSION']
    vi.clearAllMocks()
  })

  it('accepts legacy tokens without sv while the user is still on session version zero', async () => {
    state.sessionVersion = 0

    await expect(isSessionPayloadCurrent({ sub: 'user-1' })).resolves.toBe(true)
  })

  it('rejects legacy tokens after the user session version has been bumped', async () => {
    state.sessionVersion = 1

    await expect(isSessionPayloadCurrent({ sub: 'user-1' })).resolves.toBe(false)
  })

  it('accepts current tokens when sv matches the stored session version', async () => {
    state.sessionVersion = 2

    await expect(isSessionPayloadCurrent({ sub: 'user-1', sv: 2 })).resolves.toBe(true)
  })
})
