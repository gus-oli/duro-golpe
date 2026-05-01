import { config } from '../config.js'

const BASE_URL = 'https://v3.football.api-sports.io'
const RATE_LIMIT_MS = 6100 // 10 req/min = 1 req per 6s

let lastRequestTime = 0

function requireApiFootballKey(): string {
  if (!config.API_FOOTBALL_KEY) {
    throw new Error(
      'API_FOOTBALL_KEY is required for provider-backed seed. Use seed:demo for the local offline showcase dataset.',
    )
  }

  return config.API_FOOTBALL_KEY
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed))
  }
  lastRequestTime = Date.now()

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': requireApiFootballKey(),
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
  })

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`)
  }

  return response
}

export interface ApiFootballTeam {
  id: number
  name: string
  code: string
  logo: string
}

export interface ApiFootballFixture {
  id: number
  date: string
  venue: { name: string }
  status: { short: string }
  teams: {
    home: ApiFootballTeam
    away: ApiFootballTeam
  }
  goals: { home: number | null; away: number | null }
  league: { round: string }
}

export async function getTeams(leagueId = 1, season = 2026): Promise<ApiFootballTeam[]> {
  const response = await rateLimitedFetch(
    `${BASE_URL}/teams?league=${leagueId}&season=${season}`,
  )
  const data = (await response.json()) as { response: Array<{ team: ApiFootballTeam }> }
  return data.response.map((r) => r.team)
}

export async function getFixtures(leagueId = 1, season = 2026): Promise<ApiFootballFixture[]> {
  const response = await rateLimitedFetch(
    `${BASE_URL}/fixtures?league=${leagueId}&season=${season}`,
  )
  const data = (await response.json()) as { response: ApiFootballFixture[] }
  return data.response
}
