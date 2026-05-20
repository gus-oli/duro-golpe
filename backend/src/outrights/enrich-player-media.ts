import { and, eq, isNull } from 'drizzle-orm'
import {
  type ApiFootballPlayerSearchScope,
  searchPlayers,
} from '../data-providers/api-football.js'
import { db } from '../db/index.js'
import { outrightOptions } from '../db/schema/index.js'

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
    readNumberArg('season') ?? readNumberEnv('API_FOOTBALL_PLAYER_SEARCH_SEASON') ?? 2022

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
    })
    .from(outrightOptions)
    .where(
      onlyMissing
        ? and(isNull(outrightOptions.teamId), isNull(outrightOptions.playerPhotoUrl))
        : isNull(outrightOptions.teamId),
    )

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
      const candidates = await searchPlayers(playerName, searchScope)
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
          playerPhotoSource: 'api-football:search',
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
