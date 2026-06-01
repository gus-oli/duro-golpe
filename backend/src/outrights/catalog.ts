export const OUTRIGHT_MARKET_CODES = {
  CHAMPION: 'CHAMPION',
  TOP_SCORER: 'TOP_SCORER',
  GOLDEN_BALL: 'GOLDEN_BALL',
  BEST_GOALKEEPER: 'BEST_GOALKEEPER',
  FINALISTS: 'FINALISTS',
  REVELATION: 'REVELATION',
  BEST_ATTACK: 'BEST_ATTACK',
  LAST_PLACE: 'LAST_PLACE',
} as const

export type OutrightMarketCode = (typeof OUTRIGHT_MARKET_CODES)[keyof typeof OUTRIGHT_MARKET_CODES]

export interface OutrightMarketCatalogEntry {
  code: OutrightMarketCode
  name: string
  pointValue: number
  description: string
  selectionMin: number
  selectionMax: number
  optionType: 'TEAM' | 'PLAYER'
}

export const OUTRIGHT_MARKET_CATALOG: OutrightMarketCatalogEntry[] = [
  {
    code: OUTRIGHT_MARKET_CODES.CHAMPION,
    name: 'Campeão',
    pointValue: 120,
    description: 'Selecione a seleção campeã da Copa do Mundo 2026.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'TEAM',
  },
  {
    code: OUTRIGHT_MARKET_CODES.TOP_SCORER,
    name: 'Artilheiro',
    pointValue: 90,
    description: 'Selecione o artilheiro oficial do torneio.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'PLAYER',
  },
  {
    code: OUTRIGHT_MARKET_CODES.GOLDEN_BALL,
    name: 'Bola de Ouro',
    pointValue: 90,
    description: 'Selecione o vencedor oficial do prêmio Bola de Ouro da FIFA.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'PLAYER',
  },
  {
    code: OUTRIGHT_MARKET_CODES.BEST_GOALKEEPER,
    name: 'Melhor Goleiro',
    pointValue: 70,
    description: 'Selecione o vencedor oficial do prÃªmio adidas Golden Glove da FIFA.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'PLAYER',
  },
  {
    code: OUTRIGHT_MARKET_CODES.FINALISTS,
    name: 'Finalistas',
    pointValue: 90,
    description: 'Selecione as duas seleções finalistas. É preciso acertar as duas para pontuar.',
    selectionMin: 2,
    selectionMax: 2,
    optionType: 'TEAM',
  },
  {
    code: OUTRIGHT_MARKET_CODES.REVELATION,
    name: 'Revelação',
    pointValue: 70,
    description: 'Selecione o vencedor oficial do prêmio de revelação da FIFA.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'PLAYER',
  },
  {
    code: OUTRIGHT_MARKET_CODES.BEST_ATTACK,
    name: 'Melhor Ataque',
    pointValue: 80,
    description:
      'Selecione a seleção com mais gols no torneio. Em caso de empate, vale a melhor classificação final oficial da FIFA.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'TEAM',
  },
  {
    code: OUTRIGHT_MARKET_CODES.LAST_PLACE,
    name: 'Lanterna',
    pointValue: 60,
    description: 'Selecione a seleção com a pior campanha oficial do torneio.',
    selectionMin: 1,
    selectionMax: 1,
    optionType: 'TEAM',
  },
]

export const OUTRIGHT_MARKET_TOTAL_POINTS = OUTRIGHT_MARKET_CATALOG.reduce(
  (sum, market) => sum + market.pointValue,
  0,
)

export function getOutrightCatalogEntryByCode(code: OutrightMarketCode): OutrightMarketCatalogEntry {
  const market = OUTRIGHT_MARKET_CATALOG.find((entry) => entry.code === code)
  if (!market) {
    throw new Error(`Unknown outright market code: ${code}`)
  }

  return market
}
