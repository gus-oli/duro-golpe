import { createClient } from 'redis'
import { config } from '../config.js'

let redisPublisher: ReturnType<typeof createClient> | null = null

async function getPublisher(): Promise<ReturnType<typeof createClient>> {
  if (!redisPublisher) {
    redisPublisher = createClient({ url: config.REDIS_URL })
    await redisPublisher.connect()
  }

  return redisPublisher
}

interface MatchStatusChangedPayload {
  matchId: string
  status: 'LOCKED' | 'LIVE' | 'FINISHED'
  changedAt: string
  kickoffTime?: string
}

interface MatchScoreLivePayload {
  matchId: string
  homeScore: number
  awayScore: number
  updatedAt: string
  status: 'LIVE' | 'FINISHED'
}

interface MatchResultConfirmedPayload {
  matchId: string
  matchResultId: string
  homeGoals: number
  awayGoals: number
  confirmedAt: string
  source: string
}

interface UserTotalsUpdatedPayload {
  matchId: string | null
  affectedUserIds: string[]
}

export async function publishMatchStatusChanged(payload: MatchStatusChangedPayload): Promise<void> {
  const publisher = await getPublisher()
  await publisher.publish(
    'match:status:changed',
    JSON.stringify({
      type: 'match:status:changed',
      ...payload,
    }),
  )
}

export async function publishMatchScoreLive(payload: MatchScoreLivePayload): Promise<void> {
  const publisher = await getPublisher()
  await publisher.publish(
    'match:score:live',
    JSON.stringify({
      type: 'match:score:live',
      ...payload,
    }),
  )
}

export async function publishMatchResultConfirmed(payload: MatchResultConfirmedPayload): Promise<void> {
  const publisher = await getPublisher()
  await publisher.publish(
    'match:result:confirmed',
    JSON.stringify({
      type: 'match:result:confirmed',
      ...payload,
    }),
  )
}

export async function publishScoringMatchResultConfirmed(payload: MatchResultConfirmedPayload): Promise<void> {
  const publisher = await getPublisher()
  await publisher.publish(
    'match.result.confirmed',
    JSON.stringify({
      event: 'match.result.confirmed',
      ...payload,
    }),
  )
}

export async function publishUserTotalsUpdated(payload: UserTotalsUpdatedPayload): Promise<void> {
  if (payload.affectedUserIds.length === 0) {
    return
  }

  const publisher = await getPublisher()
  await publisher.publish(
    'user.totals.updated',
    JSON.stringify({
      event: 'user.totals.updated',
      ...payload,
    }),
  )
}
