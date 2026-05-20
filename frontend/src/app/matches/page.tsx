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
      <div className="space-y-6">
        <section className="dg-panel overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="dg-eyebrow">Agenda da Copa</p>
              <h1 className="mt-2 text-4xl font-black text-[var(--ink)] sm:text-5xl">Partidas</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Escolha o jogo, mande seu placar e use a agenda como centro do resto do produto.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
              <div className="dg-subtle-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Abertas</p>
                <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{openCount}</p>
              </div>
              <div className="dg-subtle-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Ao vivo</p>
                <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{liveCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Link href="/leagues" className="dg-card-interactive block p-4">
            <p className="dg-eyebrow">Ligas</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Voltar para a classificacao</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Saia da agenda direto para sua disputa privada.</p>
          </Link>
          <Link href="/outrights" className="dg-card-interactive block p-4">
            <p className="dg-eyebrow">Especiais</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Revisar mercados longos</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Nao deixe especiais abertos escondidos fora da rodada.</p>
          </Link>
          <Link href="/profile" className="dg-card-interactive block p-4">
            <p className="dg-eyebrow">Conta</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Abrir meu resumo</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Pontuacao total, ligas e proximos atalhos do dia.</p>
          </Link>
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
          <div className="space-y-7">
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
