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

startLockScheduler()
startOutrightLockScheduler()
startFootballDataSync()
await startRedisSubscriber()
await startMuralSubscriber()
await startBadgeSubscriber()
await startScoringProcessor()
await startAggregator(redisPublisher)
await startScoreBroadcaster()
