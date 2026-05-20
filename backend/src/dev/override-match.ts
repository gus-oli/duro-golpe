import { applyManualMatchOverride, getMatchByIdentifier } from '../data-providers/match-reconciliation.js'

const identifier = process.argv[2]
const rawStatus = process.argv[3]?.toUpperCase()
const rawHomeScore = process.argv[4]
const rawAwayScore = process.argv[5]

if (!identifier || !rawStatus) {
  console.error(
    'Usage: tsx src/dev/override-match.ts <MATCH_ID_OR_PROVIDER_ID> <SCHEDULED|LIVE|FINISHED> [HOME_SCORE] [AWAY_SCORE]',
  )
  process.exit(1)
}

if (!['SCHEDULED', 'LIVE', 'FINISHED'].includes(rawStatus)) {
  console.error(`Unsupported status "${rawStatus}". Use SCHEDULED, LIVE, or FINISHED.`)
  process.exit(1)
}

const parsedHomeScore = rawHomeScore != null ? Number(rawHomeScore) : null
const parsedAwayScore = rawAwayScore != null ? Number(rawAwayScore) : null

if ((rawStatus === 'LIVE' || rawStatus === 'FINISHED') && (parsedHomeScore == null || parsedAwayScore == null)) {
  console.error(`${rawStatus} override requires HOME_SCORE and AWAY_SCORE.`)
  process.exit(1)
}

if (
  (parsedHomeScore != null && !Number.isInteger(parsedHomeScore)) ||
  (parsedAwayScore != null && !Number.isInteger(parsedAwayScore))
) {
  console.error('Scores must be integers.')
  process.exit(1)
}

const match = await getMatchByIdentifier(identifier)
if (!match) {
  console.error(`Match "${identifier}" was not found.`)
  process.exit(1)
}

const result = await applyManualMatchOverride({
  identifier,
  status: rawStatus as 'SCHEDULED' | 'LIVE' | 'FINISHED',
  homeScore: parsedHomeScore,
  awayScore: parsedAwayScore,
  changedAt: new Date(),
  source: 'manual-operator',
})

console.info(
  `Manual override ${result} for ${match.id} (${match.apiFootballId ?? 'no-provider-id'}) -> ${rawStatus}${parsedHomeScore != null && parsedAwayScore != null ? ` ${parsedHomeScore}-${parsedAwayScore}` : ''}`,
)
process.exit(0)
