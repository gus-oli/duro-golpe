import { and, eq, isNull } from 'drizzle-orm'
import {
  type ApiFootballPlayerSearchScope,
  searchPlayerProfiles,
  searchPlayers,
} from '../data-providers/api-football.js'
import { db } from '../db/index.js'
import { outrightOptions } from '../db/schema/index.js'
import type { OutrightPlayerSourceTier } from './player-option-types.js'

function readNumberArg(name: string): number | undefined {
  const prefix = `--${name}=`
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
  if (!raw) return undefined

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function readNumberEnv(name: string): number | undefined {
  const raw = process.env[name]
  if (!raw) return undefined

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function getSearchScope(): ApiFootballPlayerSearchScope {
  const teamId = readNumberArg('team') ?? readNumberEnv('API_FOOTBALL_PLAYER_SEARCH_TEAM')
  const leagueId =
    readNumberArg('league') ?? readNumberEnv('API_FOOTBALL_PLAYER_SEARCH_LEAGUE') ?? 1
  const season =
    readNumberArg('season') ?? readNumberEnv('API_FOOTBALL_PLAYER_SEARCH_SEASON') ?? 2024

  return teamId ? { teamId, season } : { leagueId, season }
}

function describeSearchScope(scope: ApiFootballPlayerSearchScope): string {
  const parts = []
  if (scope.teamId) parts.push(`team=${scope.teamId}`)
  if (scope.leagueId) parts.push(`league=${scope.leagueId}`)
  if (scope.season) parts.push(`season=${scope.season}`)

  return parts.join(', ')
}

function splitPlayerLabel(label: string): { playerName: string; teamLabel: string | null } {
  const [playerName, teamLabel] = label.split(' - ').map((part) => part.trim())
  return {
    playerName: playerName ?? '',
    teamLabel: teamLabel || null,
  }
}

function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function getSearchTerms(playerName: string): string[] {
  const trimmed = playerName.trim()
  if (!trimmed) return []

  const terms = [trimmed]
  const parts = trimmed.split(/\s+/).filter(Boolean)
  const lastName = parts.at(-1)

  if (lastName && lastName.length >= 3 && !terms.includes(lastName)) {
    terms.push(lastName)
  }

  return terms
}

function sanitizeSearchTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchesPlayerName(
  playerName: string,
  candidate: { player: { name?: string; firstname?: string; lastname?: string } },
): boolean {
  const normalizedTarget = normalize(playerName)
  const fullName = normalize(candidate.player.name)
  const composedName = normalize([candidate.player.firstname, candidate.player.lastname].filter(Boolean).join(' '))

  return (
    fullName === normalizedTarget ||
    composedName === normalizedTarget ||
    fullName.includes(normalizedTarget) ||
    composedName.includes(normalizedTarget)
  )
}

async function findPlayerCandidates(
  playerName: string,
  searchScope: ApiFootballPlayerSearchScope,
) {
  for (const term of getSearchTerms(playerName)) {
    const sanitizedTerm = sanitizeSearchTerm(term)
    if (sanitizedTerm.length < 3) {
      continue
    }

    const profileCandidates = await searchPlayerProfiles(sanitizedTerm)
    const exactProfileMatches = profileCandidates.filter((candidate) => matchesPlayerName(playerName, candidate))
    if (exactProfileMatches.length > 0) {
      return { candidates: exactProfileMatches, source: 'profiles' as const }
    }

    if (profileCandidates.length > 0) {
      return { candidates: profileCandidates, source: 'profiles' as const }
    }
  }

  const fallbackTerm = sanitizeSearchTerm(playerName)
  if (fallbackTerm.length < 3) {
    return { candidates: [], source: 'search' as const }
  }

  const fallbackCandidates = await searchPlayers(fallbackTerm, searchScope)
  return { candidates: fallbackCandidates, source: 'search' as const }
}

function chooseBestPlayerMatch(
  teamLabel: string | null,
  candidates: Awaited<ReturnType<typeof searchPlayers>>,
) {
  if (!teamLabel) {
    return candidates[0] ?? null
  }

  const normalizedTeamLabel = normalize(teamLabel)
  return (
    candidates.find((candidate) =>
      candidate.statistics?.some((entry) => normalize(entry.team?.name).includes(normalizedTeamLabel)),
    ) ??
    candidates[0] ??
    null
  )
}

const SOURCE_TIER_PRIORITY: Record<OutrightPlayerSourceTier, number> = {
  OFFICIAL: 0,
  PRELIMINARY: 1,
  LIKELY: 2,
}

type PlayerPhotoRow = {
  id: string
  label: string
  teamLabel: string | null
  playerPhotoUrl: string | null
  isFeatured: boolean
  sourceTier: OutrightPlayerSourceTier | null
  sortOrder: number
}

function comparePlayerPhotoRows(a: PlayerPhotoRow, b: PlayerPhotoRow): number {
  if (a.isFeatured !== b.isFeatured) {
    return a.isFeatured ? -1 : 1
  }

  const aTier = a.sourceTier ? SOURCE_TIER_PRIORITY[a.sourceTier] : Number.MAX_SAFE_INTEGER
  const bTier = b.sourceTier ? SOURCE_TIER_PRIORITY[b.sourceTier] : Number.MAX_SAFE_INTEGER
  if (aTier !== bTier) {
    return aTier - bTier
  }

  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder
  }

  return a.label.localeCompare(b.label)
}

async function enrichPlayerPhotos(
  onlyMissing = true,
  searchScope = getSearchScope(),
): Promise<void> {
  const rows = await db
    .select({
      id: outrightOptions.id,
      label: outrightOptions.label,
      teamLabel: outrightOptions.teamLabel,
      playerPhotoUrl: outrightOptions.playerPhotoUrl,
      isFeatured: outrightOptions.isFeatured,
      sourceTier: outrightOptions.sourceTier,
      sortOrder: outrightOptions.sortOrder,
    })
    .from(outrightOptions)
    .where(
      onlyMissing
        ? and(
            isNull(outrightOptions.teamId),
            eq(outrightOptions.isActive, true),
            isNull(outrightOptions.playerPhotoUrl),
          )
        : and(isNull(outrightOptions.teamId), eq(outrightOptions.isActive, true)),
    )

  rows.sort(comparePlayerPhotoRows)

  const limit = readNumberArg('limit')
  const targetRows = limit ? rows.slice(0, limit) : rows
  let updated = 0
  let skipped = 0

  console.info(
    `[OutrightMedia] Searching ${targetRows.length}/${rows.length} player options with ${describeSearchScope(searchScope)}.`,
  )

  for (const row of targetRows) {
    const { playerName, teamLabel } = splitPlayerLabel(row.label)
    if (!playerName) {
      skipped += 1
      continue
    }

    try {
      const { candidates, source } = await findPlayerCandidates(playerName, searchScope)
      const chosen = chooseBestPlayerMatch(row.teamLabel ?? teamLabel, candidates)
      if (!chosen?.player.photo) {
        skipped += 1
        console.info(`[OutrightMedia] ${row.label} -> no provider photo`)
        continue
      }

      await db
        .update(outrightOptions)
        .set({
          playerPhotoUrl: chosen.player.photo,
          playerPhotoSource: `api-football:${source}`,
          playerPhotoUpdatedAt: new Date(),
        })
        .where(eq(outrightOptions.id, row.id))

      updated += 1
      console.info(`[OutrightMedia] ${row.label} -> ${chosen.player.photo}`)
    } catch (error) {
      skipped += 1
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[OutrightMedia] ${row.label} -> skipped (${message})`)
      continue
    }
  }

  console.info(`[OutrightMedia] Done. Updated ${updated}; skipped ${skipped}.`)
}

const refreshAll = process.argv.includes('--refresh-all')

await enrichPlayerPhotos(!refreshAll)
