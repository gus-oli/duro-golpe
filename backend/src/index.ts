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

const app = await buildServer()

await app.listen({ port: config.PORT, host: '0.0.0.0' })
app.log.info(`Server running on port ${config.PORT}`)

// Shared Redis publisher for aggregator and scorer broadcaster
const redisPublisher = createClient({ url: config.REDIS_URL })
await redisPublisher.connect()

startLockScheduler()
startOutrightLockScheduler()
await startRedisSubscriber()
await startMuralSubscriber()
await startBadgeSubscriber()
await startScoringProcessor()
await startAggregator(redisPublisher)
await startScoreBroadcaster()
