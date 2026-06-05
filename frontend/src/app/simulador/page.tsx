import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PageShell } from '@/components/ui/Primitives'
import { WorldCupSimulator } from '@/components/Simulator/WorldCupSimulator'
import { GROUP_LETTERS, isPlaceholderTeam, type GroupLetter, type SimulatorTeam } from '@/lib/world-cup-simulator'

interface MatchTeam {
  id: string
  name: string
  fifaCode: string
  flagUrl?: string | null
}

interface Match {
  stage: string
  homeTeam: MatchTeam
  awayTeam: MatchTeam
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

function getGroupFromStage(stage: string): GroupLetter | null {
  const match = stage.match(/^Grupo\s+([A-L])$/i)
  const group = match?.[1]?.toUpperCase()
  return GROUP_LETTERS.includes(group as GroupLetter) ? (group as GroupLetter) : null
}

function toSimulatorTeam(team: MatchTeam, group: GroupLetter): SimulatorTeam {
  return {
    id: team.id,
    name: team.name,
    fifaCode: team.fifaCode,
    flagUrl: team.flagUrl ?? null,
    group,
  }
}

async function getSimulatorTeams(token: string): Promise<SimulatorTeam[]> {
  try {
    const res = await fetch(`${API}/api/v1/matches`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { matches: Match[] }
    const teams = new Map<string, SimulatorTeam>()

    for (const match of data.matches) {
      const group = getGroupFromStage(match.stage)
      if (!group) continue

      for (const team of [match.homeTeam, match.awayTeam]) {
        const simulatorTeam = toSimulatorTeam(team, group)
        if (!isPlaceholderTeam(simulatorTeam)) {
          teams.set(simulatorTeam.id, simulatorTeam)
        }
      }
    }

    return Array.from(teams.values()).sort((left, right) => {
      if (left.group !== right.group) return left.group.localeCompare(right.group)
      return left.name.localeCompare(right.name, 'pt-BR')
    })
  } catch {
    return []
  }
}

export default async function SimulatorPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null

  if (!token) {
    redirect('/login?from=/simulador')
  }

  const teams = await getSimulatorTeams(token)

  return (
    <PageShell>
      <WorldCupSimulator initialTeams={teams} />
    </PageShell>
  )
}
