import { and, eq, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matchResults, matches } from '../db/schema/index.js'
import {
  publishMatchResultConfirmed,
  publishMatchScoreLive,
  publishScoringMatchResultAmended,
  publishScoringMatchResultConfirmed,
  publishMatchStatusChanged,
} from '../realtime/publisher.js'

type LocalLifecycleStatus = 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
type IncomingLifecycleStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'

interface MatchLookup {
  id: string
  apiFootballId: string | null
  status: LocalLifecycleStatus
  homeScore: number | null
  awayScore: number | null
  kickoffTime: Date
}

export interface MatchSnapshotUpdate {
  providerMatchId: string
  status: IncomingLifecycleStatus
  homeScore: number | null
  awayScore: number | null
  changedAt?: Date
  source: string
}

export interface ManualMatchOverride {
  identifier: string
  status: IncomingLifecycleStatus
  homeScore: number | null
  awayScore: number | null
  changedAt?: Date
  source: string
}

function toIsoString(value: Date | undefined): string {
  return (value ?? new Date()).toISOString()
}

export async function getMatchByIdentifier(identifier: string): Promise<MatchLookup | null> {
  const [match] = await db
    .select({
      id: matches.id,
      apiFootballId: matches.apiFootballId,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      kickoffTime: matches.kickoffTime,
    })
    .from(matches)
    .where(or(eq(matches.id, identifier), eq(matches.apiFootballId, identifier)))
    .limit(1)

  return match ?? null
}

async function loadMatchByProviderId(providerMatchId: string): Promise<MatchLookup | null> {
  const [match] = await db
    .select({
      id: matches.id,
      apiFootballId: matches.apiFootballId,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      kickoffTime: matches.kickoffTime,
    })
    .from(matches)
    .where(eq(matches.apiFootballId, providerMatchId))
    .limit(1)

  return match ?? null
}

async function applyScheduledState(match: MatchLookup): Promise<'noop' | 'updated'> {
  if (match.status !== 'SCHEDULED') {
    return 'noop'
  }

  const didChange = match.homeScore != null || match.awayScore != null
  if (!didChange) {
    return 'noop'
  }

  await db
    .update(matches)
    .set({ status: 'SCHEDULED', homeScore: null, awayScore: null })
    .where(eq(matches.id, match.id))

  return 'updated'
}

async function applyLiveState(
  match: MatchLookup,
  homeScore: number | null,
  awayScore: number | null,
  changedAt: Date | undefined,
): Promise<'noop' | 'updated'> {
  if (match.status === 'FINISHED') {
    return 'noop'
  }

  const didStatusChange = match.status !== 'LIVE'
  const didScoreChange = match.homeScore !== homeScore || match.awayScore !== awayScore
  if (!didStatusChange && !didScoreChange) {
    return 'noop'
  }

  await db
    .update(matches)
    .set({
      status: 'LIVE',
      homeScore,
      awayScore,
    })
    .where(eq(matches.id, match.id))

  const changedAtIso = toIsoString(changedAt)
  if (didStatusChange) {
    await publishMatchStatusChanged({
      matchId: match.id,
      status: 'LIVE',
      changedAt: changedAtIso,
    })
  }

  if (homeScore != null && awayScore != null) {
    await publishMatchScoreLive({
      matchId: match.id,
      homeScore,
      awayScore,
      status: 'LIVE',
      updatedAt: changedAtIso,
    })
  }

  return 'updated'
}

async function confirmOrAmendResult(
  match: MatchLookup,
  homeGoals: number,
  awayGoals: number,
  changedAt: Date | undefined,
  source: string,
): Promise<'noop' | 'confirmed' | 'amended'> {
  const [existing] = await db
    .select({
      id: matchResults.id,
      homeScore: matchResults.homeScore,
      awayScore: matchResults.awayScore,
    })
    .from(matchResults)
    .where(and(eq(matchResults.matchId, match.id), eq(matchResults.status, 'CONFIRMED')))
    .limit(1)

  const changedAtIso = toIsoString(changedAt)

  if (!existing) {
    const [result] = await db
      .insert(matchResults)
      .values({
        matchId: match.id,
        homeScore: homeGoals,
        awayScore: awayGoals,
        status: 'CONFIRMED',
        confirmedAt: changedAt ?? new Date(),
        source,
      })
      .returning({ id: matchResults.id })

    await db
      .update(matches)
      .set({ status: 'FINISHED', homeScore: homeGoals, awayScore: awayGoals })
      .where(eq(matches.id, match.id))

    if (match.status !== 'FINISHED') {
      await publishMatchStatusChanged({
        matchId: match.id,
        status: 'FINISHED',
        changedAt: changedAtIso,
      })
    }

    await publishMatchScoreLive({
      matchId: match.id,
      homeScore: homeGoals,
      awayScore: awayGoals,
      status: 'FINISHED',
      updatedAt: changedAtIso,
    })

    await publishMatchResultConfirmed({
      matchId: match.id,
      matchResultId: result!.id,
      homeGoals,
      awayGoals,
      confirmedAt: changedAtIso,
      source,
    })
    await publishScoringMatchResultConfirmed({
      matchId: match.id,
      matchResultId: result!.id,
      homeGoals,
      awayGoals,
      confirmedAt: changedAtIso,
      source,
    })

    return 'confirmed'
  }

  if (existing.homeScore === homeGoals && existing.awayScore === awayGoals) {
    const didChange =
      match.status !== 'FINISHED' || match.homeScore !== homeGoals || match.awayScore !== awayGoals

    if (didChange) {
      await db
        .update(matches)
        .set({ status: 'FINISHED', homeScore: homeGoals, awayScore: awayGoals })
        .where(eq(matches.id, match.id))

      if (match.status !== 'FINISHED') {
        await publishMatchStatusChanged({
          matchId: match.id,
          status: 'FINISHED',
          changedAt: changedAtIso,
        })
      }

      await publishMatchScoreLive({
        matchId: match.id,
        homeScore: homeGoals,
        awayScore: awayGoals,
        status: 'FINISHED',
        updatedAt: changedAtIso,
      })
    }

    return 'noop'
  }

  await db.update(matchResults).set({ status: 'AMENDED' }).where(eq(matchResults.id, existing.id))

  const [newResult] = await db
    .insert(matchResults)
    .values({
      matchId: match.id,
      homeScore: homeGoals,
      awayScore: awayGoals,
      status: 'CONFIRMED',
      confirmedAt: changedAt ?? new Date(),
      source,
    })
    .returning({ id: matchResults.id })

  await db
    .update(matches)
    .set({ status: 'FINISHED', homeScore: homeGoals, awayScore: awayGoals })
    .where(eq(matches.id, match.id))

  if (match.status !== 'FINISHED') {
    await publishMatchStatusChanged({
      matchId: match.id,
      status: 'FINISHED',
      changedAt: changedAtIso,
    })
  }

  await publishMatchScoreLive({
    matchId: match.id,
    homeScore: homeGoals,
    awayScore: awayGoals,
    status: 'FINISHED',
    updatedAt: changedAtIso,
  })

  await publishScoringMatchResultAmended({
    matchId: match.id,
    previousMatchResultId: existing.id,
    newMatchResultId: newResult!.id,
    homeGoals,
    awayGoals,
    confirmedAt: changedAtIso,
    source,
  })

  return 'amended'
}

export async function applyProviderMatchSnapshot(
  snapshot: MatchSnapshotUpdate,
): Promise<'missing' | 'noop' | 'updated' | 'confirmed' | 'amended'> {
  const match = await loadMatchByProviderId(snapshot.providerMatchId)
  if (!match) {
    return 'missing'
  }

  if (snapshot.status === 'SCHEDULED') {
    return applyScheduledState(match)
  }

  if (snapshot.status === 'LIVE') {
    return applyLiveState(match, snapshot.homeScore, snapshot.awayScore, snapshot.changedAt)
  }

  if (snapshot.homeScore == null || snapshot.awayScore == null) {
    return 'noop'
  }

  return confirmOrAmendResult(
    match,
    snapshot.homeScore,
    snapshot.awayScore,
    snapshot.changedAt,
    snapshot.source,
  )
}

export async function applyManualMatchOverride(
  input: ManualMatchOverride,
): Promise<'missing' | 'noop' | 'updated' | 'confirmed' | 'amended'> {
  const match = await getMatchByIdentifier(input.identifier)
  if (!match) {
    return 'missing'
  }

  if (input.status === 'SCHEDULED') {
    return applyScheduledState(match)
  }

  if (input.status === 'LIVE') {
    return applyLiveState(match, input.homeScore, input.awayScore, input.changedAt)
  }

  if (input.homeScore == null || input.awayScore == null) {
    throw new Error('Manual FINISHED override requires both homeScore and awayScore')
  }

  return confirmOrAmendResult(
    match,
    input.homeScore,
    input.awayScore,
    input.changedAt,
    input.source,
  )
}
