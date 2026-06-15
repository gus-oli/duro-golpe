import { eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matchPredictions, matches, matchSocialOddsSnapshots } from '../db/schema/index.js'

export const SOCIAL_ODDS_MINIMUM_SAMPLE = 1
export const SOCIAL_ODDS_UNDERDOG_THRESHOLD_BPS = 3000
export const SOCIAL_ODDS_BPS_DENOMINATOR = 10_000

export type SocialOddsOutcome = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN'
export type SocialOddsSource = 'CURRENT' | 'FROZEN'
export type SocialOddsStatus = 'UNAVAILABLE' | 'LOW_SAMPLE' | 'AVAILABLE'

export interface PredictionOutcomeInput {
  predictedHome: number
  predictedAway: number
}

export interface SocialOddsCounts {
  homeWinCount: number
  drawCount: number
  awayWinCount: number
  totalPredictions: number
}

export interface SocialOddsOutcomeShare {
  outcome: SocialOddsOutcome
  count: number
  basisPoints: number
  percentage: number
}

export interface SocialOddsView {
  status: SocialOddsStatus
  source: SocialOddsSource
  totalPredictions: number
  minimumSample: number
  underdogThresholdBps: number
  underdogThresholdPercentage: number
  capturedAt: string | null
  outcomes: SocialOddsOutcomeShare[]
}

interface SnapshotInput extends SocialOddsCounts {
  matchId: string
  capturedAt: Date
  minimumSample?: number
  underdogThresholdBps?: number
}

export function getPredictionOutcome(input: PredictionOutcomeInput): SocialOddsOutcome {
  if (input.predictedHome > input.predictedAway) return 'HOME_WIN'
  if (input.predictedAway > input.predictedHome) return 'AWAY_WIN'
  return 'DRAW'
}

export function getResultOutcome(homeScore: number, awayScore: number): SocialOddsOutcome {
  return getPredictionOutcome({ predictedHome: homeScore, predictedAway: awayScore })
}

export function countPredictionOutcomes(predictions: PredictionOutcomeInput[]): SocialOddsCounts {
  const counts: SocialOddsCounts = {
    homeWinCount: 0,
    drawCount: 0,
    awayWinCount: 0,
    totalPredictions: predictions.length,
  }

  for (const prediction of predictions) {
    const outcome = getPredictionOutcome(prediction)
    if (outcome === 'HOME_WIN') counts.homeWinCount += 1
    if (outcome === 'DRAW') counts.drawCount += 1
    if (outcome === 'AWAY_WIN') counts.awayWinCount += 1
  }

  return counts
}

function toBasisPoints(count: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((count / total) * SOCIAL_ODDS_BPS_DENOMINATOR)
}

function toPercentage(basisPoints: number): number {
  return basisPoints / 100
}

function buildOutcomeShares(counts: SocialOddsCounts): SocialOddsOutcomeShare[] {
  const homeWinBps = toBasisPoints(counts.homeWinCount, counts.totalPredictions)
  const drawBps = toBasisPoints(counts.drawCount, counts.totalPredictions)
  const awayWinBps = toBasisPoints(counts.awayWinCount, counts.totalPredictions)

  return [
    {
      outcome: 'HOME_WIN',
      count: counts.homeWinCount,
      basisPoints: homeWinBps,
      percentage: toPercentage(homeWinBps),
    },
    {
      outcome: 'DRAW',
      count: counts.drawCount,
      basisPoints: drawBps,
      percentage: toPercentage(drawBps),
    },
    {
      outcome: 'AWAY_WIN',
      count: counts.awayWinCount,
      basisPoints: awayWinBps,
      percentage: toPercentage(awayWinBps),
    },
  ]
}

export function buildSocialOddsView({
  counts,
  source,
  capturedAt,
  minimumSample = SOCIAL_ODDS_MINIMUM_SAMPLE,
  underdogThresholdBps = SOCIAL_ODDS_UNDERDOG_THRESHOLD_BPS,
}: {
  counts: SocialOddsCounts
  source: SocialOddsSource
  capturedAt: Date | null
  minimumSample?: number
  underdogThresholdBps?: number
}): SocialOddsView {
  const status: SocialOddsStatus =
    counts.totalPredictions <= 0
      ? 'UNAVAILABLE'
      : counts.totalPredictions < minimumSample
        ? 'LOW_SAMPLE'
        : 'AVAILABLE'

  return {
    status,
    source,
    totalPredictions: counts.totalPredictions,
    minimumSample,
    underdogThresholdBps,
    underdogThresholdPercentage: toPercentage(underdogThresholdBps),
    capturedAt: capturedAt ? capturedAt.toISOString() : null,
    outcomes: status === 'UNAVAILABLE' ? [] : buildOutcomeShares(counts),
  }
}

export function getOutcomeShare(view: SocialOddsView, outcome: SocialOddsOutcome): SocialOddsOutcomeShare | undefined {
  return view.outcomes.find((item) => item.outcome === outcome)
}

export function isOutcomeSocialUnderdog(view: SocialOddsView, outcome: SocialOddsOutcome): boolean {
  if (view.status !== 'AVAILABLE') return false
  const share = getOutcomeShare(view, outcome)
  return Boolean(share && share.count > 0 && share.basisPoints <= view.underdogThresholdBps)
}

async function getPredictionRows(matchId: string): Promise<PredictionOutcomeInput[]> {
  return db
    .select({
      predictedHome: matchPredictions.predictedHome,
      predictedAway: matchPredictions.predictedAway,
    })
    .from(matchPredictions)
    .where(eq(matchPredictions.matchId, matchId))
}

export async function computeCurrentSocialOdds(matchId: string): Promise<SocialOddsView> {
  const predictions = await getPredictionRows(matchId)
  return buildSocialOddsView({
    counts: countPredictionOutcomes(predictions),
    source: 'CURRENT',
    capturedAt: null,
  })
}

function snapshotInputFromCounts(input: SnapshotInput) {
  const minimumSample = input.minimumSample ?? SOCIAL_ODDS_MINIMUM_SAMPLE
  const underdogThresholdBps = input.underdogThresholdBps ?? SOCIAL_ODDS_UNDERDOG_THRESHOLD_BPS

  return {
    matchId: input.matchId,
    homeWinCount: input.homeWinCount,
    drawCount: input.drawCount,
    awayWinCount: input.awayWinCount,
    totalPredictions: input.totalPredictions,
    homeWinBps: toBasisPoints(input.homeWinCount, input.totalPredictions),
    drawBps: toBasisPoints(input.drawCount, input.totalPredictions),
    awayWinBps: toBasisPoints(input.awayWinCount, input.totalPredictions),
    minimumSample,
    underdogThresholdBps,
    capturedAt: input.capturedAt,
  }
}

export async function createOrUpdateSocialOddsSnapshot(matchId: string, capturedAt = new Date()): Promise<SocialOddsView> {
  const predictions = await getPredictionRows(matchId)
  const values = snapshotInputFromCounts({
    matchId,
    capturedAt,
    ...countPredictionOutcomes(predictions),
  })

  const [snapshot] = await db
    .insert(matchSocialOddsSnapshots)
    .values(values)
    .onConflictDoUpdate({
      target: matchSocialOddsSnapshots.matchId,
      set: values,
    })
    .returning()

  return snapshot ? socialOddsViewFromSnapshot(snapshot) : computeCurrentSocialOdds(matchId)
}

export async function getFrozenSocialOdds(matchId: string): Promise<SocialOddsView | null> {
  const [snapshot] = await db
    .select()
    .from(matchSocialOddsSnapshots)
    .where(eq(matchSocialOddsSnapshots.matchId, matchId))
    .limit(1)

  return snapshot ? socialOddsViewFromSnapshot(snapshot) : null
}

export function unavailableFrozenSocialOdds(): SocialOddsView {
  return buildSocialOddsView({
    counts: {
      homeWinCount: 0,
      drawCount: 0,
      awayWinCount: 0,
      totalPredictions: 0,
    },
    source: 'FROZEN',
    capturedAt: null,
  })
}

export function socialOddsViewFromSnapshot(snapshot: {
  homeWinCount: number
  drawCount: number
  awayWinCount: number
  totalPredictions: number
  minimumSample: number
  underdogThresholdBps: number
  capturedAt: Date
}): SocialOddsView {
  return buildSocialOddsView({
    counts: {
      homeWinCount: snapshot.homeWinCount,
      drawCount: snapshot.drawCount,
      awayWinCount: snapshot.awayWinCount,
      totalPredictions: snapshot.totalPredictions,
    },
    source: 'FROZEN',
    capturedAt: snapshot.capturedAt,
    minimumSample: snapshot.minimumSample,
    underdogThresholdBps: snapshot.underdogThresholdBps,
  })
}

export async function getSocialOddsForMatch({
  matchId,
  effectiveStatus,
  hasUserPrediction,
}: {
  matchId: string
  effectiveStatus: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  hasUserPrediction: boolean
}): Promise<SocialOddsView | null> {
  if (effectiveStatus === 'SCHEDULED') {
    return hasUserPrediction ? computeCurrentSocialOdds(matchId) : null
  }

  return (await getFrozenSocialOdds(matchId)) ?? unavailableFrozenSocialOdds()
}

export async function isPredictionSocialUnderdog({
  matchId,
  predictedHome,
  predictedAway,
}: {
  matchId: string
  predictedHome: number
  predictedAway: number
}): Promise<boolean> {
  const frozenOdds = await getFrozenSocialOdds(matchId)
  if (!frozenOdds) return false
  return isOutcomeSocialUnderdog(frozenOdds, getPredictionOutcome({ predictedHome, predictedAway }))
}

export async function backfillMissingSocialOddsSnapshots(now = new Date()): Promise<number> {
  const rows = await db
    .select({ id: matches.id })
    .from(matches)
    .where(inArray(matches.status, ['LOCKED', 'LIVE', 'FINISHED']))

  let created = 0
  for (const row of rows) {
    const existing = await getFrozenSocialOdds(row.id)
    if (existing) continue
    await createOrUpdateSocialOddsSnapshot(row.id, now)
    created += 1
  }

  return created
}
