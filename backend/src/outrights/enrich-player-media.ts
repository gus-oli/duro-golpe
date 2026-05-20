import { and, eq, isNull } from 'drizzle-orm'
import { searchPlayers } from '../data-providers/api-football.js'
import { db } from '../db/index.js'
import { outrightOptions } from '../db/schema/index.js'

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

async function enrichPlayerPhotos(onlyMissing = true): Promise<void> {
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

  for (const row of rows) {
    const { playerName, teamLabel } = splitPlayerLabel(row.label)
    if (!playerName) continue

    const candidates = await searchPlayers(playerName)
    const chosen = chooseBestPlayerMatch(row.teamLabel ?? teamLabel, candidates)
    if (!chosen?.player.photo) {
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

    console.info(`[OutrightMedia] ${row.label} -> ${chosen.player.photo}`)
  }
}

const refreshAll = process.argv.includes('--refresh-all')

await enrichPlayerPhotos(!refreshAll)
