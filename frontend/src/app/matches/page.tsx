import Link from 'next/link'
import { MatchCard } from '@/components/MatchCard/MatchCard'
import { EmptyState, PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'

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
  const liveCount = matches.filter((match) => match.status === 'LIVE').length
  const openCount = matches.filter((match) => match.status === 'SCHEDULED').length

  return (
    <PageShell>
      <div className="space-y-8">
        <section className="dg-surface-dark overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Agenda da Copa</p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">Partidas</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">
                Escolha o jogo, mande seu placar e acompanhe a virada da tabela.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
              <div className="rounded-md bg-white/10 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/65">Abertas</p>
                <p className="mt-1 font-[var(--font-display)] text-3xl font-black">{openCount}</p>
              </div>
              <div className="rounded-md bg-white/10 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/65">Ao vivo</p>
                <p className="mt-1 font-[var(--font-display)] text-3xl font-black">{liveCount}</p>
              </div>
            </div>
          </div>
        </section>

        {matches.length === 0 ? (
          <EmptyState
            title="Nenhuma partida disponivel"
            description="Quando o calendario estiver carregado, os jogos aparecem aqui com status e horario."
            action={
              <Link href="/" className="dg-button-secondary">
                Voltar para home
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([date, dayMatches]) => (
              <section key={date} className="space-y-4">
                <SectionHeader
                  eyebrow="Rodada"
                  title={date}
                  actions={<StatusPill tone="neutral">{dayMatches.length} jogos</StatusPill>}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  {dayMatches.map((match) => (
                    <MatchCard key={match.id} {...match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
