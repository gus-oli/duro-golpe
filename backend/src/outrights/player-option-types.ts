export const OUTRIGHT_PLAYER_SOURCE_TIERS = ['OFFICIAL', 'PRELIMINARY', 'LIKELY'] as const

export type OutrightPlayerSourceTier = (typeof OUTRIGHT_PLAYER_SOURCE_TIERS)[number]
