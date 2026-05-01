import { MatchCard } from '@/components/MatchCard/MatchCard'

export const revalidate = 300

interface Match {
  id: string
  kickoffTime: string
  stage: string
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeScore?: number | null
  awayScore?: number | null
  homeTeam: { id: string; name: string; fifaCode: string; flagUrl?: string | null }
  awayTeam: { id: string; name: string; fifaCode: string; flagUrl?: string | null }
}

async function getMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${process.env['API_URL'] ?? 'http://localhost:3001'}/api/v1/matches`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { matches: Match[] }
    return data.matches
  } catch {
    return []
  }
}

function groupByDate(matches: Match[]): Map<string, Match[]> {
  const groups = new Map<string, Match[]>()
  for (const match of matches) {
    const date = new Date(match.kickoffTime).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
    const group = groups.get(date) ?? []
    group.push(match)
    groups.set(date, group)
  }
  return groups
}

export default async function MatchesPage() {
  const matches = await getMatches()
  const grouped = groupByDate(matches)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Partidas</h1>

      {matches.length === 0 && (
        <p className="text-gray-500 text-center py-12">Nenhuma partida disponível.</p>
      )}

      {Array.from(grouped.entries()).map(([date, dayMatches]) => (
        <section key={date} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">{date}</h2>
          <div className="flex flex-col gap-3">
            {dayMatches.map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
