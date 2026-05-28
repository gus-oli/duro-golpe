export const SCORING_REFERENCE_ROUTE = '/pontuacao'

export const TOURNAMENT_MATCH_COUNT = 104
export const MATCH_SCORING_MAX_POINTS = 25
export const THEORETICAL_MATCH_POINTS = TOURNAMENT_MATCH_COUNT * MATCH_SCORING_MAX_POINTS

export const MATCH_SCORING_TIERS = [
  {
    code: 'EXACT_SCORE',
    label: 'Placar exato',
    points: 25,
    description: 'Acerta os gols dos dois lados exatamente como o resultado oficial.',
  },
  {
    code: 'WINNER_AND_GOAL_DIFF',
    label: 'Vencedor + saldo',
    points: 15,
    description: 'Acerta quem venceu e tambem a diferenca de gols em jogos sem empate.',
  },
  {
    code: 'WINNER_OR_DRAW',
    label: 'Vencedor ou empate',
    points: 10,
    description: 'Acerta o resultado macro da partida, mesmo com placar diferente.',
  },
  {
    code: 'ONE_TEAM_GOALS',
    label: 'Gols de um time',
    points: 5,
    description: 'Acerta os gols de apenas um lado, mas erra o desfecho da partida.',
  },
  {
    code: 'TOTAL_MISS',
    label: 'Erro total',
    points: 0,
    description: 'Nao bate em nenhum dos tiers acima.',
  },
] as const

export const OUTRIGHT_SCORING_MARKETS = [
  { code: 'CHAMPION', name: 'Campeao', pointValue: 120, note: 'Selecao campea da Copa.' },
  { code: 'TOP_SCORER', name: 'Artilheiro', pointValue: 90, note: 'Artilheiro oficial do torneio.' },
  { code: 'GOLDEN_BALL', name: 'Bola de Ouro', pointValue: 90, note: 'Melhor jogador oficial da FIFA.' },
  { code: 'FINALISTS', name: 'Finalistas', pointValue: 90, note: 'Precisa acertar as duas selecoes finalistas.' },
  { code: 'REVELATION', name: 'Revelacao', pointValue: 70, note: 'Destaque jovem oficial da FIFA.' },
  { code: 'BEST_ATTACK', name: 'Melhor Ataque', pointValue: 80, note: 'Time com mais gols, com desempate pela classificacao final oficial.' },
  { code: 'LAST_PLACE', name: 'Lanterna', pointValue: 60, note: 'Pior campanha oficial do torneio.' },
] as const

export const OUTRIGHT_SCORING_TOTAL_POINTS = OUTRIGHT_SCORING_MARKETS.reduce(
  (sum, market) => sum + market.pointValue,
  0,
)

export const THEORETICAL_MAX_POINTS = THEORETICAL_MATCH_POINTS + OUTRIGHT_SCORING_TOTAL_POINTS

export const SCORING_EXAMPLES = [
  {
    title: 'Placar exato',
    prediction: '2 x 1',
    result: '2 x 1',
    points: 25,
    explanation: 'Acertou os dois placares exatamente.',
  },
  {
    title: 'Vencedor + saldo',
    prediction: '3 x 1',
    result: '2 x 0',
    points: 15,
    explanation: 'Acertou quem venceu e o saldo de 2 gols.',
  },
  {
    title: 'Vencedor ou empate',
    prediction: '1 x 1',
    result: '0 x 0',
    points: 10,
    explanation: 'Acertou o empate, mas nao o placar exato.',
  },
  {
    title: 'Gols de um time',
    prediction: '2 x 1',
    result: '2 x 3',
    points: 5,
    explanation: 'Acertou os gols de um lado, mas errou o resultado final.',
  },
] as const

export const RANKING_TIEBREAKERS = [
  'Total de pontos',
  'Mais placares exatos',
  'Mais acertos de vencedor + saldo',
] as const
