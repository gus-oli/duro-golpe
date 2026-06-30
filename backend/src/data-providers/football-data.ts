import { config } from '../config.js'
import { formatFootballDataStage } from './football-data-formatting.js'

const BASE_URL = 'https://api.football-data.org/v4'

function requireFootballDataToken(): string {
  if (!config.FOOTBALL_DATA_TOKEN) {
    throw new Error(
      'FOOTBALL_DATA_TOKEN is required for football-data.org ingestion and polling. Use seed:demo for the local offline showcase dataset.',
    )
  }

  return config.FOOTBALL_DATA_TOKEN
}

async function footballDataFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'X-Auth-Token': requireFootballDataToken(),
    },
  })

  if (!response.ok) {
    let details = `${response.status} ${response.statusText}`
    try {
      const data = (await response.json()) as { error?: string; message?: string }
      details = data.error ?? data.message ?? details
    } catch {
      // ignore malformed provider error payloads
    }

    throw new Error(`football-data.org error: ${details}`)
  }

  return (await response.json()) as T
}

export interface FootballDataTeam {
  id: number
  name: string
  tla: string | null
  crest: string | null
}

interface FootballDataTeamsResponse {
  teams: FootballDataTeam[]
}

export interface FootballDataScoreLine {
  home: number | null
  away: number | null
}

export interface FootballDataScore {
  duration?: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | string | null
  fullTime: FootballDataScoreLine
  regularTime?: FootballDataScoreLine | null
  extraTime?: FootballDataScoreLine | null
  penalties?: FootballDataScoreLine | null
}

export interface FootballDataMatch {
  id: number
  utcDate: string
  status: string
  venue: string | null
  stage: string | null
  group: string | null
  lastUpdated: string
  homeTeam: FootballDataTeam
  awayTeam: FootballDataTeam
  score: FootballDataScore
}

interface FootballDataMatchesResponse {
  matches: FootballDataMatch[]
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') {
      continue
    }

    query.set(key, String(value))
  }

  const rendered = query.toString()
  return rendered ? `?${rendered}` : ''
}

export { formatFootballDataStage } from './football-data-formatting.js'

function hasCompleteScoreLine(score: FootballDataScoreLine | null | undefined): score is { home: number; away: number } {
  return typeof score?.home === 'number' && typeof score.away === 'number'
}

function addScoreLines(
  first: FootballDataScoreLine | null | undefined,
  second: FootballDataScoreLine | null | undefined,
): FootballDataScoreLine | null {
  if (!hasCompleteScoreLine(first) || !hasCompleteScoreLine(second)) {
    return null
  }

  return {
    home: first.home + second.home,
    away: first.away + second.away,
  }
}

function subtractScoreLines(
  total: FootballDataScoreLine | null | undefined,
  subtract: FootballDataScoreLine | null | undefined,
): FootballDataScoreLine | null {
  if (!hasCompleteScoreLine(total) || !hasCompleteScoreLine(subtract)) {
    return null
  }

  const home = total.home - subtract.home
  const away = total.away - subtract.away
  if (home < 0 || away < 0) {
    return null
  }

  return { home, away }
}

export function getPlayableFootballDataScore(score: FootballDataScore): FootballDataScoreLine {
  if (score.duration !== 'PENALTY_SHOOTOUT') {
    return score.fullTime
  }

  return addScoreLines(score.regularTime, score.extraTime)
    ?? subtractScoreLines(score.fullTime, score.penalties)
    ?? score.fullTime
}

export async function getWorldCupTeams(): Promise<FootballDataTeam[]> {
  const path = `/competitions/${config.FOOTBALL_DATA_COMPETITION_CODE}/teams${buildQuery({
    season: config.FOOTBALL_DATA_SEASON,
  })}`
  const data = await footballDataFetch<FootballDataTeamsResponse>(path)
  return data.teams ?? []
}

export interface FootballDataMatchFilters {
  dateFrom?: string
  dateTo?: string
  status?: string
}

export async function getWorldCupMatches(
  filters?: FootballDataMatchFilters,
): Promise<FootballDataMatch[]> {
  const path = `/competitions/${config.FOOTBALL_DATA_COMPETITION_CODE}/matches${buildQuery({
    season: config.FOOTBALL_DATA_SEASON,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo,
    status: filters?.status,
  })}`
  const data = await footballDataFetch<FootballDataMatchesResponse>(path)
  return data.matches ?? []
}
