import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  leagueMemberships,
  type OutrightOption,
  outrightMarketResults,
  outrightMarkets,
  outrightOptions,
  outrightPredictions,
  teams,
  users,
} from '../db/schema/index.js'
import { scoreResolvedOutrightMarket } from './scoring.js'
import { normalizeOutrightOptionIds, validateSelectionCardinality } from './outright-utils.js'
import { assertActiveLeagueMember } from '../auth/access-control.js'
import { hasColumns } from '../db/optional-columns.js'
import { localizeTeamName } from '../seeds/team-localization.js'

export { validateFinalistsPrediction } from './outright-utils.js'

export interface LeagueMemberOutrightDto {
  userId: string
  displayName: string
  avatarUrl: string | null
  selections: Array<{
    optionId: string
    label: string
    teamLabel: string | null
    sourceTier: string | null
    teamId: string | null
    teamFlagUrl: string | null
    playerPhotoUrl: string | null
  }>
  submittedAt: string | null
}

export interface LeagueUserOutrightSelectionDto {
  marketId: string
  marketName: string
  marketCode: string
  optionType: 'TEAM' | 'PLAYER'
  selections: Array<{
    optionId: string
    label: string
    teamLabel: string | null
    sourceTier: string | null
    teamId: string | null
    teamFlagUrl: string | null
    playerPhotoUrl: string | null
  }>
  submittedAt: string | null
}

function sortMarketOptions<T extends OutrightOption>(options: T[]): T[] {
  return [...options].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1
    }

    if (left.isFeatured !== right.isFeatured) {
      return left.isFeatured ? -1 : 1
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }

    return left.label.localeCompare(right.label)
  })
}

function buildOutrightOptionLabel(option: {
  label: string
  teamId: string | null
  teamName?: string | null
  teamFifaCode?: string | null
}): string {
  if (!option.teamId || !option.teamFifaCode) return option.label
  return localizeTeamName(option.teamFifaCode, option.teamName ?? option.label)
}

async function hasOutrightPlayerMediaColumns(): Promise<boolean> {
  return hasColumns('outright_options', ['player_photo_url', 'player_photo_source', 'player_photo_updated_at'])
}

async function assertTargetLeagueMember(leagueId: string, targetUserId: string): Promise<void> {
  const [membership] = await db
    .select({ userId: leagueMemberships.userId })
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, targetUserId),
        eq(leagueMemberships.isActive, true),
      ),
    )
    .limit(1)

  if (!membership) {
    throw Object.assign(new Error('Membro da liga nao encontrado'), { statusCode: 404 })
  }
}

export async function getOutrights(userId: string): Promise<unknown[]> {
  const hasPlayerMedia = await hasOutrightPlayerMediaColumns()

  const [markets, options, userPredictions] = await Promise.all([
    db.select().from(outrightMarkets).orderBy(outrightMarkets.sortOrder),
    db
      .select({
        id: outrightOptions.id,
        marketId: outrightOptions.marketId,
        label: outrightOptions.label,
        teamId: outrightOptions.teamId,
        sourceTier: outrightOptions.sourceTier,
        isActive: outrightOptions.isActive,
        isFeatured: outrightOptions.isFeatured,
        sortOrder: outrightOptions.sortOrder,
        teamLabel: outrightOptions.teamLabel,
        teamName: teams.name,
        teamFifaCode: teams.fifaCode,
        teamFlagUrl: teams.flagUrl,
        playerPhotoUrl: hasPlayerMedia ? outrightOptions.playerPhotoUrl : sql<string | null>`null`,
        playerPhotoSource: hasPlayerMedia ? outrightOptions.playerPhotoSource : sql<string | null>`null`,
        playerPhotoUpdatedAt: hasPlayerMedia
          ? outrightOptions.playerPhotoUpdatedAt
          : sql<Date | null>`null`,
      })
      .from(outrightOptions)
      .leftJoin(teams, eq(outrightOptions.teamId, teams.id)),
    db.select().from(outrightPredictions).where(eq(outrightPredictions.userId, userId)),
  ])

  return markets.map((market) => {
    const marketOptions = sortMarketOptions(options.filter((option) => option.marketId === market.id))
      .map((option) => ({
        ...option,
        label: buildOutrightOptionLabel(option),
      }))
    const selectedOptionIds = userPredictions
      .filter((prediction) => prediction.marketId === market.id)
      .map((prediction) => prediction.optionId)

    return {
      ...market,
      options: marketOptions,
      userPrediction: selectedOptionIds[0] ? { optionId: selectedOptionIds[0] } : null,
      userSelections: selectedOptionIds,
    }
  })
}

export async function createOutrightPrediction(
  userId: string,
  marketId: string,
  optionIds: string[],
): Promise<{ optionIds: string[]; submittedAt: string }> {
  const [market] = await db
    .select()
    .from(outrightMarkets)
    .where(eq(outrightMarkets.id, marketId))
    .limit(1)

  if (!market) {
    const err = Object.assign(new Error('Mercado não encontrado'), { statusCode: 404 })
    throw err
  }

  if (market.status !== 'OPEN') {
    const err = Object.assign(new Error('Mercado encerrado'), { statusCode: 403 })
    throw err
  }

  if (!validateSelectionCardinality(optionIds, market.selectionMin, market.selectionMax)) {
    const err = Object.assign(
      new Error(`Este mercado exige entre ${market.selectionMin} e ${market.selectionMax} seleção(ões).`),
      { statusCode: 400 },
    )
    throw err
  }

  const normalizedOptionIds = normalizeOutrightOptionIds(optionIds)
  const marketOptions = await db
    .select({ id: outrightOptions.id })
    .from(outrightOptions)
    .where(and(eq(outrightOptions.marketId, marketId), inArray(outrightOptions.id, normalizedOptionIds)))

  if (marketOptions.length !== normalizedOptionIds.length) {
    const err = Object.assign(new Error('Uma ou mais opções não pertencem a este mercado.'), { statusCode: 400 })
    throw err
  }

  const submittedAt = new Date()

  await db
    .delete(outrightPredictions)
    .where(and(eq(outrightPredictions.userId, userId), eq(outrightPredictions.marketId, marketId)))

  await db.insert(outrightPredictions).values(
    normalizedOptionIds.map((optionId) => ({
      userId,
      marketId,
      optionId,
      submittedAt,
    })),
  )

  return {
    optionIds: normalizedOptionIds,
    submittedAt: submittedAt.toISOString(),
  }
}

export async function getLeagueOutrightPredictions(
  requestingUserId: string,
  leagueId: string,
  marketId: string,
): Promise<LeagueMemberOutrightDto[]> {
  await assertActiveLeagueMember(requestingUserId, leagueId)
  const hasPlayerMedia = await hasOutrightPlayerMediaColumns()

  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      optionId: outrightOptions.id,
      label: outrightOptions.label,
      teamLabel: outrightOptions.teamLabel,
      sourceTier: outrightOptions.sourceTier,
      teamId: outrightOptions.teamId,
      teamName: teams.name,
      teamFifaCode: teams.fifaCode,
      teamFlagUrl: teams.flagUrl,
      playerPhotoUrl: hasPlayerMedia ? outrightOptions.playerPhotoUrl : sql<string | null>`null`,
      submittedAt: outrightPredictions.submittedAt,
    })
    .from(leagueMemberships)
    .innerJoin(users, eq(leagueMemberships.userId, users.id))
    .leftJoin(
      outrightPredictions,
      and(eq(outrightPredictions.userId, leagueMemberships.userId), eq(outrightPredictions.marketId, marketId)),
    )
    .leftJoin(outrightOptions, eq(outrightPredictions.optionId, outrightOptions.id))
    .leftJoin(teams, eq(outrightOptions.teamId, teams.id))
    .where(and(eq(leagueMemberships.leagueId, leagueId), eq(leagueMemberships.isActive, true)))
    .orderBy(asc(users.displayName), asc(outrightOptions.sortOrder), asc(outrightOptions.label))

  const byUser = new Map<string, LeagueMemberOutrightDto>()
  for (const row of rows) {
    const existing = byUser.get(row.userId) ?? {
      userId: row.userId,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl ?? null,
      selections: [],
      submittedAt: row.submittedAt?.toISOString() ?? null,
    }

    if (row.optionId && row.label) {
      existing.selections.push({
        optionId: row.optionId,
        label: buildOutrightOptionLabel({
          label: row.label,
          teamId: row.teamId ?? null,
          teamName: row.teamName ?? null,
          teamFifaCode: row.teamFifaCode ?? null,
        }),
        teamLabel: row.teamLabel ?? null,
        sourceTier: row.sourceTier ?? null,
        teamId: row.teamId ?? null,
        teamFlagUrl: row.teamFlagUrl ?? null,
        playerPhotoUrl: row.playerPhotoUrl ?? null,
      })
    }

    if (!existing.submittedAt && row.submittedAt) {
      existing.submittedAt = row.submittedAt.toISOString()
    }

    byUser.set(row.userId, existing)
  }

  return [...byUser.values()]
}

export async function getLeagueUserOutrightSelections(
  requestingUserId: string,
  leagueId: string,
  targetUserId: string,
): Promise<LeagueUserOutrightSelectionDto[]> {
  await assertActiveLeagueMember(requestingUserId, leagueId)
  await assertTargetLeagueMember(leagueId, targetUserId)
  const hasPlayerMedia = await hasOutrightPlayerMediaColumns()

  const rows = await db
    .select({
      marketId: outrightMarkets.id,
      marketName: outrightMarkets.name,
      marketCode: outrightMarkets.code,
      optionType: outrightMarkets.optionType,
      optionId: outrightOptions.id,
      label: outrightOptions.label,
      teamLabel: outrightOptions.teamLabel,
      sourceTier: outrightOptions.sourceTier,
      teamId: outrightOptions.teamId,
      teamName: teams.name,
      teamFifaCode: teams.fifaCode,
      teamFlagUrl: teams.flagUrl,
      playerPhotoUrl: hasPlayerMedia ? outrightOptions.playerPhotoUrl : sql<string | null>`null`,
      submittedAt: outrightPredictions.submittedAt,
    })
    .from(outrightPredictions)
    .innerJoin(outrightMarkets, eq(outrightPredictions.marketId, outrightMarkets.id))
    .innerJoin(outrightOptions, eq(outrightPredictions.optionId, outrightOptions.id))
    .leftJoin(teams, eq(outrightOptions.teamId, teams.id))
    .where(eq(outrightPredictions.userId, targetUserId))
    .orderBy(asc(outrightMarkets.sortOrder), asc(outrightOptions.sortOrder), asc(outrightOptions.label))

  const byMarket = new Map<string, LeagueUserOutrightSelectionDto>()
  for (const row of rows) {
    const existing = byMarket.get(row.marketId) ?? {
      marketId: row.marketId,
      marketName: row.marketName,
      marketCode: row.marketCode,
      optionType: row.optionType,
      selections: [],
      submittedAt: row.submittedAt?.toISOString() ?? null,
    }

    if (row.optionId && row.label) {
      existing.selections.push({
        optionId: row.optionId,
        label: buildOutrightOptionLabel(row),
        teamLabel: row.teamLabel ?? null,
        sourceTier: row.sourceTier ?? null,
        teamId: row.teamId ?? null,
        teamFlagUrl: row.teamFlagUrl ?? null,
        playerPhotoUrl: row.playerPhotoUrl ?? null,
      })
    }

    if (!existing.submittedAt && row.submittedAt) {
      existing.submittedAt = row.submittedAt.toISOString()
    }

    byMarket.set(row.marketId, existing)
  }

  return [...byMarket.values()]
}

export async function recordOutrightMarketResult(
  marketId: string,
  optionIds: string[],
  notes?: string,
): Promise<{ optionIds: string[]; resolvedAt: string }> {
  const [market] = await db
    .select()
    .from(outrightMarkets)
    .where(eq(outrightMarkets.id, marketId))
    .limit(1)

  if (!market) {
    const err = Object.assign(new Error('Mercado não encontrado'), { statusCode: 404 })
    throw err
  }

  if (!validateSelectionCardinality(optionIds, market.selectionMin, market.selectionMax)) {
    const err = Object.assign(
      new Error(`Este mercado exige entre ${market.selectionMin} e ${market.selectionMax} opção(ões) vencedora(s).`),
      { statusCode: 400 },
    )
    throw err
  }

  const normalizedOptionIds = normalizeOutrightOptionIds(optionIds)
  if (normalizedOptionIds.length === 0) {
    const err = Object.assign(new Error('Informe ao menos uma opção vencedora.'), { statusCode: 400 })
    throw err
  }

  if (normalizedOptionIds.length !== optionIds.length) {
    const err = Object.assign(new Error('Opções vencedoras duplicadas não são permitidas.'), { statusCode: 400 })
    throw err
  }

  const marketOptions = await db
    .select({ id: outrightOptions.id })
    .from(outrightOptions)
    .where(and(eq(outrightOptions.marketId, marketId), inArray(outrightOptions.id, normalizedOptionIds)))

  if (marketOptions.length !== normalizedOptionIds.length) {
    const err = Object.assign(new Error('Uma ou mais opções vencedoras não pertencem a este mercado.'), {
      statusCode: 400,
    })
    throw err
  }

  const resolvedAt = new Date()

  await db.delete(outrightMarketResults).where(eq(outrightMarketResults.marketId, marketId))
  await db.insert(outrightMarketResults).values(
    normalizedOptionIds.map((optionId) => ({
      marketId,
      optionId,
      notes,
      resolvedAt,
    })),
  )

  await db.update(outrightMarkets).set({ status: 'RESOLVED' }).where(eq(outrightMarkets.id, marketId))
  await scoreResolvedOutrightMarket(marketId)

  return {
    optionIds: normalizedOptionIds,
    resolvedAt: resolvedAt.toISOString(),
  }
}
