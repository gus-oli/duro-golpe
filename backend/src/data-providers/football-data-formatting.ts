export function formatFootballDataStage(stage: string | null, group: string | null): string {
  if (group?.startsWith('GROUP_')) {
    return `Grupo ${group.replace('GROUP_', '')}`
  }

  switch (stage) {
    case 'GROUP_STAGE':
      return 'Fase de grupos'
    case 'LAST_32':
      return 'Round of 32'
    case 'LAST_16':
      return 'Oitavas'
    case 'QUARTER_FINALS':
      return 'Quartas'
    case 'SEMI_FINALS':
      return 'Semifinais'
    case 'THIRD_PLACE':
      return 'Terceiro lugar'
    case 'FINAL':
      return 'Final'
    default:
      return stage?.replace(/_/g, ' ') ?? 'World Cup'
  }
}
