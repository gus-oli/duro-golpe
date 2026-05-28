import { buildServer } from './server.js'
import { config } from './config.js'
import { startLockScheduler } from './matches/lock-scheduler.js'
import { startOutrightLockScheduler } from './outrights/lock-scheduler.js'
import { startRedisSubscriber } from './realtime/broadcaster.js'
import { startMuralSubscriber } from './mural/broadcaster.js'
import { startBadgeSubscriber } from './badges/evaluator.js'
import { startScoringProcessor } from './scoring/processor.js'
import { startAggregator } from './scoring/aggregator.js'
import { startScoreBroadcaster } from './scoring/broadcaster.js'
import { createClient } from 'redis'
import { startFootballDataSync } from './data-providers/sync-football-data.js'

const app = await buildServer()

await app.listen({ port: config.PORT, host: config.BIND_HOST })
app.log.info(`Server running on ${config.BIND_HOST}:${config.PORT}`)

// Shared Redis publisher for aggregator and scorer broadcaster
const redisPublisher = createClient({ url: config.REDIS_URL })
await redisPublisher.connect()

function startLockSchedulers(): void {
  startLockScheduler()
  startOutrightLockScheduler()
}

function scheduleLockSchedulersStart(): void {
  const startAt = config.LOCK_SCHEDULERS_START_AT

  if (!startAt || Date.now() >= startAt.getTime()) {
    startLockSchedulers()
    return
  }

  const delayMs = Math.min(startAt.getTime() - Date.now(), 2_147_483_647)
  app.log.info(`Lock schedulers waiting until ${startAt.toISOString()}`)

  const timer = setTimeout(() => {
    scheduleLockSchedulersStart()
  }, delayMs)
  timer.unref?.()
}

if (config.LOCK_SCHEDULERS_ENABLED) {
  scheduleLockSchedulersStart()
} else {
  app.log.info('Lock schedulers disabled by LOCK_SCHEDULERS_ENABLED=false')
}

startFootballDataSync()
await startRedisSubscriber()
await startMuralSubscriber()
await startBadgeSubscriber()
await startScoringProcessor()
await startAggregator(redisPublisher)
await startScoreBroadcaster()
