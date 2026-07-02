import { syncFootballDataOnce } from './sync-football-data.js'
import { repairConfirmedMatchScores } from '../scoring/repair.js'

console.info('[FootballDataRepair] Polling football-data.org...')
const syncSummary = await syncFootballDataOnce(new Date())
console.info(JSON.stringify({ sync: syncSummary }, null, 2))
console.info('[FootballDataRepair] Reconciling confirmed match scores...')
const repairSummary = await repairConfirmedMatchScores({
  onProgress: (message) => console.info(`[FootballDataRepair] ${message}`),
})

console.info(JSON.stringify({ sync: syncSummary, repair: repairSummary }, null, 2))
process.exit(0)
