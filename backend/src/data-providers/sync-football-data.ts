import { and, eq, gte, inArray, lte, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matches } from '../db/schema/index.js'
import { config } from '../config.js'
import { getPlayableFootballDataScore, getWorldCupMatches, type FootballDataMatch } from './football-data.js'
import { applyProviderMatchSnapshot } from './match-reconciliation.js'
import { mapFootballDataStatus } from '../realtime/events.js'
import { upsertTeams } from '../seeds/support.js'
import { localizeTeamName } from '../seeds/team-localization.js'

const ACTIVE_POLL_DELAY_MS = 10_000
const IDLE_POLL_DELAY_MS = 60_000
const ACTIVE_LOOKBACK_HOURS = 4
const ACTIVE_LOOKAHEAD_HOURS = 4
const IDLE_LOOKAHEAD_DAYS = 2
const DATE_WINDOW_BUFFER_DAYS = 1
const MAX_TIMEOUT_MS = 2_147_483_647

export interface FootballDataSyncSummary {
  processed: number
  applied: number
  skipped: number
  missing: number
  nextDelayMs: number
  dateFrom: string
  dateTo: string
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function addHours(value: Date, hours: number): Date {
  return new Date(value.getTime() + hours * 60 * 60 * 1000)
}

function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000)
}

async function reconcileMatchParticipants(providerMatch: FootballDataMatch): Promise<void> {
  const teamInputs = [
    providerMatch.homeTeam.id != null &&
    providerMatch.homeTeam.tla &&
    providerMatch.homeTeam.name
      ? {
          key: String(providerMatch.homeTeam.id),
          apiFootballId: String(providerMatch.homeTeam.id),
          name: localizeTeamName(providerMatch.homeTeam.tla, providerMatch.homeTeam.name),
          fifaCode: providerMatch.homeTeam.tla,
          flagUrl: providerMatch.homeTeam.crest,
        }
      : null,
    providerMatch.awayTeam.id != null &&
    providerMatch.awayTeam.tla &&
    providerMatch.awayTeam.name
      ? {
          key: String(providerMatch.awayTeam.id),
          apiFootballId: String(providerMatch.awayTeam.id),
          name: localizeTeamName(providerMatch.awayTeam.tla, providerMatch.awayTeam.name),
          fifaCode: providerMatch.awayTeam.tla,
          flagUrl: providerMatch.awayTeam.crest,
        }
      : null,
  ].filter((team): team is NonNullable<typeof team> => team != null)

  if (teamInputs.length === 0) {
    return
  }

  const teamIdsByKey = await upsertTeams(teamInputs)
  const participantUpdate: Partial<typeof matches.$inferInsert> = {}

  if (providerMatch.homeTeam.id != null) {
    const homeTeamId = teamIdsByKey[String(providerMatch.homeTeam.id)]
    if (homeTeamId) {
      participantUpdate.homeTeamId = homeTeamId
    }
  }

  if (providerMatch.awayTeam.id != null) {
    const awayTeamId = teamIdsByKey[String(providerMatch.awayTeam.id)]
    if (awayTeamId) {
      participantUpdate.awayTeamId = awayTeamId
    }
  }

  if (Object.keys(participantUpdate).length === 0) {
    return
  }

  await db
    .update(matches)
    .set(participantUpdate)
    .where(eq(matches.apiFootballId, String(providerMatch.id)))
}

async function hasActiveWindow(now: Date): Promise<boolean> {
  const liveOrNearby = await db
    .select({ id: matches.id })
    .from(matches)
    .where(
      or(
        eq(matches.status, 'LIVE'),
        and(
          inArray(matches.status, ['SCHEDULED', 'LOCKED']),
          gte(matches.kickoffTime, addHours(now, -ACTIVE_LOOKBACK_HOURS)),
          lte(matches.kickoffTime, addHours(now, ACTIVE_LOOKAHEAD_HOURS)),
        ),
      ),
    )
    .limit(1)

  return liveOrNearby.length > 0
}

function buildWindow(now: Date, active: boolean): { dateFrom: string; dateTo: string; nextDelayMs: number } {
  const dateFrom = formatDate(addDays(now, -DATE_WINDOW_BUFFER_DAYS))
  const dateTo = active
    ? formatDate(addDays(now, DATE_WINDOW_BUFFER_DAYS))
    : formatDate(addDays(now, IDLE_LOOKAHEAD_DAYS))

  return {
    dateFrom,
    dateTo,
    nextDelayMs: active ? ACTIVE_POLL_DELAY_MS : IDLE_POLL_DELAY_MS,
  }
}

export async function syncFootballDataOnce(now = new Date()): Promise<FootballDataSyncSummary> {
  const active = await hasActiveWindow(now)
  const window = buildWindow(now, active)
  const providerMatches = await getWorldCupMatches({
    dateFrom: window.dateFrom,
    dateTo: window.dateTo,
  })

  let processed = 0
  let applied = 0
  let skipped = 0
  let missing = 0

  for (const providerMatch of providerMatches) {
    await reconcileMatchParticipants(providerMatch)

    const mappedStatus = mapFootballDataStatus(providerMatch.status)
    if (!mappedStatus) {
      skipped += 1
      continue
    }

    processed += 1
    const playableScore = getPlayableFootballDataScore(providerMatch.score)
    const result = await applyProviderMatchSnapshot({
      providerMatchId: String(providerMatch.id),
      status: mappedStatus,
      homeScore: playableScore.home,
      awayScore: playableScore.away,
      changedAt: providerMatch.lastUpdated ? new Date(providerMatch.lastUpdated) : now,
      source: 'football-data-v4-poll',
    })

    if (result === 'missing') {
      missing += 1
      continue
    }

    if (result === 'noop') {
      skipped += 1
      continue
    }

    applied += 1
  }

  return {
    processed,
    applied,
    skipped,
    missing,
    nextDelayMs: window.nextDelayMs,
    dateFrom: window.dateFrom,
    dateTo: window.dateTo,
  }
}

export function startFootballDataSync(): void {
  if (!config.FOOTBALL_DATA_POLL_ENABLED) {
    console.info('[FootballDataSync] Polling disabled; skipping provider sync loop')
    return
  }

  const startAt = config.FOOTBALL_DATA_POLL_START_AT
  if (startAt && Date.now() < startAt.getTime()) {
    const delayMs = Math.min(startAt.getTime() - Date.now(), MAX_TIMEOUT_MS)
    console.info(`[FootballDataSync] Polling waiting until ${startAt.toISOString()}`)

    const timer = setTimeout(() => {
      startFootballDataSync()
    }, delayMs)
    timer.unref?.()
    return
  }

  if (!config.FOOTBALL_DATA_TOKEN) {
    console.warn('[FootballDataSync] FOOTBALL_DATA_TOKEN missing; provider sync loop not started')
    return
  }

  const loop = async (): Promise<void> => {
    let delayMs = IDLE_POLL_DELAY_MS

    try {
      const summary = await syncFootballDataOnce(new Date())
      delayMs = summary.nextDelayMs
      console.info(
        `[FootballDataSync] Window ${summary.dateFrom}..${summary.dateTo} | processed=${summary.processed} applied=${summary.applied} skipped=${summary.skipped} missing=${summary.missing} next=${summary.nextDelayMs}ms`,
      )
    } catch (error) {
      console.error('[FootballDataSync] Sync cycle failed:', error)
    }

    setTimeout(() => {
      void loop()
    }, delayMs)
  }

  void loop()
  console.info('[FootballDataSync] Started adaptive football-data.org sync loop')
}
