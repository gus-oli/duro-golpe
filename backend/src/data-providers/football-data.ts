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
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
  }
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
