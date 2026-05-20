export type PlayerSourceTier = 'OFFICIAL' | 'PRELIMINARY' | 'LIKELY'

export interface PlayerOptionView {
  id: string
  label: string
  teamFlagUrl?: string | null
  playerPhotoUrl?: string | null
  teamLabel?: string | null
  sourceTier?: PlayerSourceTier | null
  isActive?: boolean
  isFeatured?: boolean
}

export interface VisiblePlayerOptionsResult {
  options: PlayerOptionView[]
  totalMatches: number
  capped: boolean
}

export const PLAYER_SEARCH_RESULT_LIMIT = 12

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function matchesQuery(option: PlayerOptionView, query: string): boolean {
  const haystack = normalize([option.label, option.teamLabel ?? ''].join(' '))
  return haystack.includes(normalize(query))
}

export function getVisiblePlayerOptions(
  options: PlayerOptionView[],
  selectedIds: string[],
  query: string,
): VisiblePlayerOptionsResult {
  const selected = options.filter((option) => selectedIds.includes(option.id))
  const activeOptions = options.filter((option) => option.isActive !== false)
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    const featured = activeOptions.filter((option) => option.isFeatured).slice(0, 5)
    const pinnedSelection = selected.filter((option) => !featured.some((featuredOption) => featuredOption.id === option.id))

    return {
      options: [...pinnedSelection, ...featured],
      totalMatches: featured.length,
      capped: false,
    }
  }

  const matches = activeOptions.filter((option) => matchesQuery(option, trimmedQuery))
  const visibleMatches = matches.slice(0, PLAYER_SEARCH_RESULT_LIMIT)
  const pinnedSelection = selected.filter((option) => !visibleMatches.some((match) => match.id === option.id))

  return {
    options: [...pinnedSelection, ...visibleMatches],
    totalMatches: matches.length,
    capped: matches.length > PLAYER_SEARCH_RESULT_LIMIT,
  }
}

export function getPlayerSourceTierLabel(sourceTier?: PlayerSourceTier | null): string | null {
  if (sourceTier === 'OFFICIAL') return 'Oficial'
  if (sourceTier === 'PRELIMINARY') return 'Pre-lista'
  if (sourceTier === 'LIKELY') return 'Provavel'
  return null
}
