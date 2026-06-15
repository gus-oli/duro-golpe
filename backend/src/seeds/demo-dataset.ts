import { OUTRIGHT_MARKET_CODES, type OutrightMarketCode } from '../outrights/catalog.js'
import type { SeedMatchInput, SeedMatchStatus, SeedTeamInput } from './support.js'
import { createSeedFlagDataUri } from './visuals.js'

export const DEMO_PASSWORD = 'durogolpe123'

export interface DemoUserFixture {
  email: string
  displayName: string
  avatarUrl: string
}

export interface DemoLeagueFixture {
  key: string
  name: string
  inviteCode: string
  createdByEmail: string
  memberEmails: string[]
}

export interface DemoMatchFixture {
  apiFootballId: string
  homeTeamKey: string
  awayTeamKey: string
  kickoffTime: string
  stage: string
  venue: string
  status: SeedMatchStatus
  homeScore?: number | null
  awayScore?: number | null
}

export interface DemoPredictionFixture {
  userEmail: string
  matchApiFootballId: string
  predictedHome: number
  predictedAway: number
}

export interface DemoMuralPostFixture {
  leagueKey: string
  matchApiFootballId: string
  userEmail: string
  content: string
  minutesAfterKickoff: number
}

export interface DemoOutrightPredictionFixture {
  userEmail: string
  marketCode: OutrightMarketCode
  optionLabels: string[]
}

export interface DemoOutrightMarketFixture {
  marketCode: OutrightMarketCode
  status: 'OPEN' | 'LOCKED' | 'RESOLVED'
  resultLabels?: string[]
}

export interface DemoBadgeFixture {
  userEmail: string
  badgeType: 'O_MESTRE' | 'PE_FRIO' | 'ZEBRA_HUNTER'
  triggerMatchApiFootballId?: string
  zebraCount?: number
}

function createAvatarDataUri(initials: string, background: string, accent: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initials}">
      <defs>
        <linearGradient id="avatar" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="28" fill="url(#avatar)" />
      <circle cx="74" cy="24" r="10" fill="#ffffff" fill-opacity="0.18" />
      <text x="48" y="57" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `.replace(/\s+/g, ' ')

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const DEMO_TEAMS: SeedTeamInput[] = [
  {
    key: 'BRA',
    name: 'Brasil',
    fifaCode: 'BRA',
    groupLetter: 'A',
    flagUrl: createSeedFlagDataUri('BRA', '#0a7f44', '#f7d64a', '#1d4ed8'),
  },
  {
    key: 'FRA',
    name: 'França',
    fifaCode: 'FRA',
    groupLetter: 'A',
    flagUrl: createSeedFlagDataUri('FRA', '#0f3bb5', '#ffffff', '#d62839'),
  },
  {
    key: 'ARG',
    name: 'Argentina',
    fifaCode: 'ARG',
    groupLetter: 'B',
    flagUrl: createSeedFlagDataUri('ARG', '#60a5fa', '#ffffff', '#fbbf24'),
  },
  {
    key: 'GER',
    name: 'Alemanha',
    fifaCode: 'GER',
    groupLetter: 'B',
    flagUrl: createSeedFlagDataUri('GER', '#111827', '#dc2626', '#fbbf24'),
  },
  {
    key: 'ESP',
    name: 'Espanha',
    fifaCode: 'ESP',
    groupLetter: 'C',
    flagUrl: createSeedFlagDataUri('ESP', '#b91c1c', '#f59e0b', '#7c2d12'),
  },
  {
    key: 'ENG',
    name: 'Inglaterra',
    fifaCode: 'ENG',
    groupLetter: 'C',
    flagUrl: createSeedFlagDataUri('ENG', '#f8fafc', '#dbeafe', '#dc2626'),
  },
  {
    key: 'JPN',
    name: 'Japão',
    fifaCode: 'JPN',
    groupLetter: 'D',
    flagUrl: createSeedFlagDataUri('JPN', '#ffffff', '#e5e7eb', '#dc2626'),
  },
  {
    key: 'MAR',
    name: 'Marrocos',
    fifaCode: 'MAR',
    groupLetter: 'D',
    flagUrl: createSeedFlagDataUri('MAR', '#b91c1c', '#991b1b', '#0f766e'),
  },
] as const

export const DEMO_USERS: DemoUserFixture[] = [
  {
    email: 'ana@demo.durogolpe.local',
    displayName: 'Ana Costa',
    avatarUrl: createAvatarDataUri('AC', '#ff6b6b', '#f59e0b'),
  },
  {
    email: 'bruno@demo.durogolpe.local',
    displayName: 'Bruno Lima',
    avatarUrl: createAvatarDataUri('BL', '#2563eb', '#06b6d4'),
  },
  {
    email: 'carla@demo.durogolpe.local',
    displayName: 'Carla Souza',
    avatarUrl: createAvatarDataUri('CS', '#7c3aed', '#ec4899'),
  },
  {
    email: 'diego@demo.durogolpe.local',
    displayName: 'Diego Martins',
    avatarUrl: createAvatarDataUri('DM', '#047857', '#84cc16'),
  },
] as const

export const DEMO_LEAGUES: DemoLeagueFixture[] = [
  {
    key: 'FIRMA',
    name: 'Bolão da Firma',
    inviteCode: 'FIRMA26',
    createdByEmail: 'ana@demo.durogolpe.local',
    memberEmails: [
      'ana@demo.durogolpe.local',
      'bruno@demo.durogolpe.local',
      'carla@demo.durogolpe.local',
      'diego@demo.durogolpe.local',
    ],
  },
  {
    key: 'VAR',
    name: 'Mesa do VAR',
    inviteCode: 'MESAVAR',
    createdByEmail: 'diego@demo.durogolpe.local',
    memberEmails: [
      'ana@demo.durogolpe.local',
      'diego@demo.durogolpe.local',
      'bruno@demo.durogolpe.local',
    ],
  },
] as const

export const DEMO_MATCH_FIXTURES: DemoMatchFixture[] = [
  {
    apiFootballId: 'demo-match-001',
    homeTeamKey: 'BRA',
    awayTeamKey: 'FRA',
    kickoffTime: '2026-06-14T20:00:00.000Z',
    stage: 'Grupo A',
    venue: 'Estadio Azteca',
    status: 'SCHEDULED',
  },
  {
    apiFootballId: 'demo-match-002',
    homeTeamKey: 'ARG',
    awayTeamKey: 'GER',
    kickoffTime: '2026-06-15T18:00:00.000Z',
    stage: 'Grupo B',
    venue: 'MetLife Stadium',
    status: 'LOCKED',
  },
  {
    apiFootballId: 'demo-match-003',
    homeTeamKey: 'ESP',
    awayTeamKey: 'ENG',
    kickoffTime: '2026-06-16T22:00:00.000Z',
    stage: 'Grupo C',
    venue: 'SoFi Stadium',
    status: 'LIVE',
    homeScore: 1,
    awayScore: 1,
  },
  {
    apiFootballId: 'demo-match-004',
    homeTeamKey: 'JPN',
    awayTeamKey: 'MAR',
    kickoffTime: '2026-06-11T16:00:00.000Z',
    stage: 'Grupo D',
    venue: 'BC Place',
    status: 'FINISHED',
    homeScore: 1,
    awayScore: 0,
  },
  {
    apiFootballId: 'demo-match-005',
    homeTeamKey: 'BRA',
    awayTeamKey: 'GER',
    kickoffTime: '2026-06-12T20:00:00.000Z',
    stage: 'Grupo A',
    venue: 'AT&T Stadium',
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 0,
  },
  {
    apiFootballId: 'demo-match-006',
    homeTeamKey: 'FRA',
    awayTeamKey: 'ARG',
    kickoffTime: '2026-06-13T22:00:00.000Z',
    stage: 'Grupo B',
    venue: 'Hard Rock Stadium',
    status: 'FINISHED',
    homeScore: 3,
    awayScore: 2,
  },
  {
    apiFootballId: 'demo-match-007',
    homeTeamKey: 'MAR',
    awayTeamKey: 'ESP',
    kickoffTime: '2026-06-17T18:00:00.000Z',
    stage: 'Grupo C',
    venue: 'Arrowhead Stadium',
    status: 'SCHEDULED',
  },
  {
    apiFootballId: 'demo-match-008',
    homeTeamKey: 'ENG',
    awayTeamKey: 'JPN',
    kickoffTime: '2026-06-18T20:00:00.000Z',
    stage: 'Grupo D',
    venue: 'Lumen Field',
    status: 'LOCKED',
  },
] as const

export const DEMO_PREDICTIONS: DemoPredictionFixture[] = [
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-001', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-002', predictedHome: 1, predictedAway: 1 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-003', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-004', predictedHome: 1, predictedAway: 0 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-005', predictedHome: 3, predictedAway: 1 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-006', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-007', predictedHome: 1, predictedAway: 1 },
  { userEmail: 'ana@demo.durogolpe.local', matchApiFootballId: 'demo-match-008', predictedHome: 2, predictedAway: 0 },

  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-001', predictedHome: 1, predictedAway: 0 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-002', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-003', predictedHome: 1, predictedAway: 2 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-004', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-005', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-006', predictedHome: 1, predictedAway: 2 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-007', predictedHome: 0, predictedAway: 1 },
  { userEmail: 'bruno@demo.durogolpe.local', matchApiFootballId: 'demo-match-008', predictedHome: 3, predictedAway: 1 },

  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-001', predictedHome: 0, predictedAway: 2 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-002', predictedHome: 1, predictedAway: 3 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-003', predictedHome: 0, predictedAway: 1 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-004', predictedHome: 0, predictedAway: 2 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-005', predictedHome: 1, predictedAway: 3 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-006', predictedHome: 1, predictedAway: 1 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-007', predictedHome: 0, predictedAway: 2 },
  { userEmail: 'carla@demo.durogolpe.local', matchApiFootballId: 'demo-match-008', predictedHome: 1, predictedAway: 2 },

  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-001', predictedHome: 2, predictedAway: 0 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-002', predictedHome: 0, predictedAway: 1 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-003', predictedHome: 1, predictedAway: 1 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-004', predictedHome: 1, predictedAway: 0 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-005', predictedHome: 2, predictedAway: 0 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-006', predictedHome: 3, predictedAway: 2 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-007', predictedHome: 2, predictedAway: 1 },
  { userEmail: 'diego@demo.durogolpe.local', matchApiFootballId: 'demo-match-008', predictedHome: 2, predictedAway: 0 },
] as const

export const DEMO_LEAGUE_POSTS: DemoMuralPostFixture[] = [
  {
    leagueKey: 'FIRMA',
    matchApiFootballId: 'demo-match-001',
    userEmail: 'ana@demo.durogolpe.local',
    content: 'Brasil chegou voando. Se o Vini encaixar, esse bolão vai pegar fogo.',
    minutesAfterKickoff: -180,
  },
  {
    leagueKey: 'FIRMA',
    matchApiFootballId: 'demo-match-001',
    userEmail: 'bruno@demo.durogolpe.local',
    content: 'Já deixei meu 1x0 sofrido. Tradição também pontua.',
    minutesAfterKickoff: -120,
  },
  {
    leagueKey: 'FIRMA',
    matchApiFootballId: 'demo-match-003',
    userEmail: 'diego@demo.durogolpe.local',
    content: 'Esse Espanha x Inglaterra está com cara de empate traiçoeiro.',
    minutesAfterKickoff: 12,
  },
  {
    leagueKey: 'VAR',
    matchApiFootballId: 'demo-match-005',
    userEmail: 'diego@demo.durogolpe.local',
    content: 'Placar exato em Brasil x Alemanha. Quem lidera não brinca em serviço.',
    minutesAfterKickoff: 140,
  },
  {
    leagueKey: 'VAR',
    matchApiFootballId: 'demo-match-006',
    userEmail: 'ana@demo.durogolpe.local',
    content: 'Ainda estou indignada com esse gol no fim da França. Salvou metade do ranking.',
    minutesAfterKickoff: 85,
  },
] as const

export const DEMO_OUTRIGHT_MARKETS: DemoOutrightMarketFixture[] = [
  {
    marketCode: OUTRIGHT_MARKET_CODES.CHAMPION,
    status: 'RESOLVED',
    resultLabels: ['Brasil'],
  },
  {
    marketCode: OUTRIGHT_MARKET_CODES.TOP_SCORER,
    status: 'LOCKED',
  },
  {
    marketCode: OUTRIGHT_MARKET_CODES.GOLDEN_BALL,
    status: 'OPEN',
  },
  {
    marketCode: OUTRIGHT_MARKET_CODES.FINALISTS,
    status: 'RESOLVED',
    resultLabels: ['Brasil', 'França'],
  },
  {
    marketCode: OUTRIGHT_MARKET_CODES.REVELATION,
    status: 'OPEN',
  },
  {
    marketCode: OUTRIGHT_MARKET_CODES.BEST_ATTACK,
    status: 'RESOLVED',
    resultLabels: ['Brasil'],
  },
  {
    marketCode: OUTRIGHT_MARKET_CODES.LAST_PLACE,
    status: 'LOCKED',
  },
] as const

export const DEMO_OUTRIGHT_PREDICTIONS: DemoOutrightPredictionFixture[] = [
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.CHAMPION, optionLabels: ['Brasil'] },
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.TOP_SCORER, optionLabels: ['Vinicius Junior'] },
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.GOLDEN_BALL, optionLabels: ['Jude Bellingham'] },
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.FINALISTS, optionLabels: ['Brasil', 'Argentina'] },
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.REVELATION, optionLabels: ['Lamine Yamal'] },
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.BEST_ATTACK, optionLabels: ['Brasil'] },
  { userEmail: 'ana@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.LAST_PLACE, optionLabels: ['Japão'] },

  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.CHAMPION, optionLabels: ['França'] },
  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.TOP_SCORER, optionLabels: ['Harry Kane'] },
  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.GOLDEN_BALL, optionLabels: ['Rodri'] },
  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.FINALISTS, optionLabels: ['Brasil', 'França'] },
  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.REVELATION, optionLabels: ['Endrick'] },
  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.BEST_ATTACK, optionLabels: ['Inglaterra'] },
  { userEmail: 'bruno@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.LAST_PLACE, optionLabels: ['Marrocos'] },

  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.CHAMPION, optionLabels: ['Alemanha'] },
  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.TOP_SCORER, optionLabels: ['Erling Haaland'] },
  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.GOLDEN_BALL, optionLabels: ['Pedri'] },
  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.FINALISTS, optionLabels: ['Alemanha', 'Espanha'] },
  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.REVELATION, optionLabels: ['Warren Zaire-Emery'] },
  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.BEST_ATTACK, optionLabels: ['França'] },
  { userEmail: 'carla@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.LAST_PLACE, optionLabels: ['Brasil'] },

  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.CHAMPION, optionLabels: ['Brasil'] },
  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.TOP_SCORER, optionLabels: ['Kylian Mbappe'] },
  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.GOLDEN_BALL, optionLabels: ['Vinicius Junior'] },
  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.FINALISTS, optionLabels: ['Brasil', 'França'] },
  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.REVELATION, optionLabels: ['Lamine Yamal'] },
  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.BEST_ATTACK, optionLabels: ['Brasil'] },
  { userEmail: 'diego@demo.durogolpe.local', marketCode: OUTRIGHT_MARKET_CODES.LAST_PLACE, optionLabels: ['Japão'] },
] as const

export const DEMO_BADGES: DemoBadgeFixture[] = [
  {
    userEmail: 'diego@demo.durogolpe.local',
    badgeType: 'O_MESTRE',
    triggerMatchApiFootballId: 'demo-match-006',
  },
  {
    userEmail: 'carla@demo.durogolpe.local',
    badgeType: 'PE_FRIO',
    triggerMatchApiFootballId: 'demo-match-006',
  },
  {
    userEmail: 'ana@demo.durogolpe.local',
    badgeType: 'ZEBRA_HUNTER',
    triggerMatchApiFootballId: 'demo-match-004',
    zebraCount: 2,
  },
] as const

export function buildDemoMatches(): SeedMatchInput[] {
  return DEMO_MATCH_FIXTURES.map((fixture) => ({
    apiFootballId: fixture.apiFootballId,
    homeTeamKey: fixture.homeTeamKey,
    awayTeamKey: fixture.awayTeamKey,
    kickoffTime: new Date(fixture.kickoffTime),
    stage: fixture.stage,
    venue: fixture.venue,
    status: fixture.status,
    homeScore: fixture.homeScore ?? null,
    awayScore: fixture.awayScore ?? null,
  }))
}
