import Fastify, { type FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import websocket from '@fastify/websocket'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import { wsPlugin } from '../../src/realtime/ws-plugin.js'

const accessControlMocks = vi.hoisted(() => ({
  assertActiveLeagueMember: vi.fn(),
  matchExists: vi.fn(),
}))

const muralBroadcasterMocks = vi.hoisted(() => ({
  subscribeToMural: vi.fn(),
}))

const matchBroadcasterMocks = vi.hoisted(() => ({
  subscribeToMatch: vi.fn(),
}))

const sessionMocks = vi.hoisted(() => ({
  registerUserSession: vi.fn(),
}))

vi.mock('../../src/auth/access-control.js', () => accessControlMocks)
vi.mock('../../src/mural/broadcaster.js', () => muralBroadcasterMocks)
vi.mock('../../src/realtime/broadcaster.js', () => matchBroadcasterMocks)
vi.mock('../../src/realtime/user-sessions.js', () => sessionMocks)

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('Realtime websocket security (integration)', () => {
  let app: FastifyInstance
  let token: string
  let wsUrl: string
  let clients: WebSocket[] = []

  beforeEach(async () => {
    app = Fastify()
    await app.register(jwt, {
      secret: 'x'.repeat(32),
      formatUser: (payload) => ({ id: payload.sub }),
    })
    await app.register(websocket)
    await app.register(wsPlugin)

    token = app.jwt.sign({ sub: 'user-1' })
    accessControlMocks.assertActiveLeagueMember.mockResolvedValue(undefined)
    accessControlMocks.matchExists.mockResolvedValue(true)

    await app.listen({ host: '127.0.0.1', port: 0 })
    const address = app.server.address()
    if (!address || typeof address === 'string') {
      throw new Error('Could not determine websocket test address')
    }
    wsUrl = `ws://127.0.0.1:${address.port}/ws`
  })

  afterEach(async () => {
    await Promise.all(
      clients.map(
        (client) =>
          new Promise<void>((resolve) => {
            if (client.readyState === WebSocket.CLOSED) {
              resolve()
              return
            }

            client.once('close', () => resolve())
            client.close()
          }),
      ),
    )
    clients = []
    vi.clearAllMocks()
    await app.close()
  })

  async function connectAuthenticated(): Promise<WebSocket> {
    return await new Promise((resolve, reject) => {
      const client = new WebSocket(wsUrl, {
        headers: { Cookie: `auth_token=${encodeURIComponent(token)}` },
      })
      clients.push(client)
      client.once('open', () => resolve(client))
      client.once('error', reject)
    })
  }

  it('rejects websocket connections without an auth cookie', async () => {
    const closeCode = await new Promise<number>((resolve, reject) => {
      const client = new WebSocket(wsUrl)
      clients.push(client)
      client.once('close', (code) => resolve(code))
      client.once('error', reject)
    })

    expect(closeCode).toBe(1008)
    expect(sessionMocks.registerUserSession).not.toHaveBeenCalled()
  })

  it('denies mural subscriptions outside the caller league scope', async () => {
    accessControlMocks.assertActiveLeagueMember.mockRejectedValue(new Error('Acesso negado'))
    const client = await connectAuthenticated()

    client.send(JSON.stringify({ type: 'subscribe:mural', leagueId: 'league-2' }))
    await wait(50)

    expect(muralBroadcasterMocks.subscribeToMural).not.toHaveBeenCalled()
  })

  it('allows mural subscriptions for active league members', async () => {
    const client = await connectAuthenticated()

    client.send(JSON.stringify({ type: 'subscribe:mural', leagueId: 'league-1' }))
    await wait(50)

    expect(muralBroadcasterMocks.subscribeToMural).toHaveBeenCalledWith('league-1', expect.any(Object))
  })

  it('does not expose the removed legacy websocket route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/ws/matches/match-1',
    })

    expect(response.statusCode).toBe(404)
  })
})
