import { syncFootballDataOnce } from './sync-football-data.js'

const summary = await syncFootballDataOnce(new Date())
console.info(JSON.stringify(summary, null, 2))
process.exit(0)
