export interface OptionMediaShape {
  label: string
  playerPhotoUrl?: string | null
  teamFlagUrl?: string | null
}

export function getOptionMedia(option: OptionMediaShape) {
  if (option.playerPhotoUrl) {
    return { kind: 'player-photo' as const, src: option.playerPhotoUrl, fallbackText: null }
  }

  if (option.teamFlagUrl) {
    return { kind: 'team-flag' as const, src: option.teamFlagUrl, fallbackText: null }
  }

  return {
    kind: 'fallback' as const,
    src: null,
    fallbackText: option.label[0]?.toUpperCase() ?? '?',
  }
}
