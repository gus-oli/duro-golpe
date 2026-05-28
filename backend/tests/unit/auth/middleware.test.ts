import type { FastifyReply, FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({
  isCurrent: vi.fn(),
}))

vi.mock('../../../src/auth/session-lifecycle.js', () => ({
  isSessionPayloadCurrent: session.isCurrent,
}))

import { requireAuth } from '../../../src/auth/middleware.js'

function createReply() {
  const reply = {
    status: vi.fn(() => reply),
    send: vi.fn(() => reply),
  }

  return reply
}

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.isCurrent.mockResolvedValue(true)
  })

  it('checks the raw JWT payload, not the formatted request user', async () => {
    const rawPayload = { sub: 'user-1', sv: 3 }
    const request = {
      headers: { authorization: 'Bearer token' },
      jwtVerify: vi.fn().mockResolvedValue({ id: 'user-1' }),
      jwtDecode: vi.fn().mockResolvedValue(rawPayload),
      log: { info: vi.fn() },
    } as unknown as FastifyRequest
    const reply = createReply() as unknown as FastifyReply

    await requireAuth(request, reply, vi.fn())

    expect(session.isCurrent).toHaveBeenCalledWith(rawPayload)
    expect((reply as unknown as ReturnType<typeof createReply>).status).not.toHaveBeenCalled()
  })

  it('rejects when the decoded session version is stale', async () => {
    session.isCurrent.mockResolvedValue(false)

    const request = {
      headers: { authorization: 'Bearer token' },
      jwtVerify: vi.fn().mockResolvedValue({ id: 'user-1' }),
      jwtDecode: vi.fn().mockResolvedValue({ sub: 'user-1', sv: 1 }),
      log: { info: vi.fn() },
    } as unknown as FastifyRequest
    const reply = createReply() as unknown as FastifyReply

    await requireAuth(request, reply, vi.fn())

    const typedReply = reply as unknown as ReturnType<typeof createReply>
    expect(request.log.info).toHaveBeenCalledWith({ reason: 'stale-session' }, 'Authentication rejected')
    expect(typedReply.status).toHaveBeenCalledWith(401)
  })
})
