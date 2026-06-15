import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'
import {
  MATCH_SCORING_TIERS,
  MATCH_SCORING_MAX_POINTS,
  OUTRIGHT_SCORING_MARKETS,
  OUTRIGHT_SCORING_TOTAL_POINTS,
  RANKING_TIEBREAKERS,
  SCORING_EXAMPLES,
  THEORETICAL_MATCH_POINTS,
  THEORETICAL_MAX_POINTS,
  TOURNAMENT_MATCH_COUNT,
} from '@/lib/scoring-reference'

export default async function ScoringReferencePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  if (!token) {
    redirect('/login?from=/pontuacao')
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-panel overflow-hidden p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="resolved">{THEORETICAL_MAX_POINTS} pts máximos</StatusPill>
                <span className="dg-chip">{OUTRIGHT_SCORING_MARKETS.length} especiais</span>
                <span className="dg-chip">{TOURNAMENT_MATCH_COUNT} jogos</span>
              </div>
              <h1 className="mt-4 text-4xl font-black text-[var(--ink)] sm:text-5xl">Como a pontuação funciona</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                Aqui fica a regra oficial do bolão: quanto vale cada acerto de partida, como os especiais entram na conta
                e por que a classificação desempata do jeito que desempata.
              </p>
            </div>

            <div className="dg-surface-dark p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Teto teórico</p>
              <p className="mt-2 font-[var(--font-display)] text-4xl font-black">{THEORETICAL_MAX_POINTS} pts</p>
              <div className="mt-4 grid gap-2 text-sm text-white/82">
                <div className="flex items-center justify-between gap-3 rounded-md bg-white/8 px-3 py-2">
                  <span>Partidas</span>
                  <strong>{THEORETICAL_MATCH_POINTS} pts</strong>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-white/8 px-3 py-2">
                  <span>Especiais</span>
                  <strong>{OUTRIGHT_SCORING_TOTAL_POINTS} pts</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Partidas"
            title="Pontuação por jogo"
            description={`Cada partida entrega um único tier, sem acumular pontos entre critérios. O máximo por jogo é ${MATCH_SCORING_MAX_POINTS} pontos.`}
          />

          <div className="grid gap-4 lg:grid-cols-5">
            {MATCH_SCORING_TIERS.map((tier) => (
              <article key={tier.code} className="dg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{tier.label}</p>
                <p className="mt-3 font-[var(--font-display)] text-4xl font-black text-[var(--pitch-dark)]">{tier.points}</p>
                <p className="mt-1 text-sm font-bold text-[var(--muted)]">pts</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{tier.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Exemplos"
            title="Leituras rápidas da regra"
            description="Os casos abaixo ajudam a separar tiers parecidos sem você precisar decorar a engine."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {SCORING_EXAMPLES.map((example) => (
              <article key={example.title} className="dg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{example.title}</p>
                    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Palpite</p>
                        <p className="mt-1 font-[var(--font-display)] text-2xl font-black text-[var(--ink)]">{example.prediction}</p>
                      </div>
                      <span className="text-lg font-black text-[var(--gold)]" aria-hidden>
                        /
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Resultado</p>
                        <p className="mt-1 font-[var(--font-display)] text-2xl font-black text-[var(--ink)]">{example.result}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-[rgba(12,143,79,0.12)] px-3 py-2 text-right">
                    <p className="font-[var(--font-display)] text-2xl font-black text-[var(--pitch-dark)]">{example.points}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--pitch-dark)]">pts</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{example.explanation}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Especiais"
            title="Mercados que pesam na tabela"
              description={`Os especiais somam ${OUTRIGHT_SCORING_TOTAL_POINTS} pontos no teto total e entram no mesmo placar da liga quando forem resolvidos.`}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {OUTRIGHT_SCORING_MARKETS.map((market) => (
              <article key={market.code} className="dg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{market.name}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{market.note}</p>
                  </div>
                  <div className="rounded-md bg-[rgba(22,129,255,0.1)] px-3 py-2 text-right">
                    <p className="font-[var(--font-display)] text-2xl font-black text-[var(--accent-strong)]">{market.pointValue}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">pts</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Conquistas"
            title="Como nasce uma Zebra Hunter"
            description="A zebra social usa o consenso do bolao, nao odds de casa de aposta."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="dg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">Snapshot</p>
              <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Congela no lock</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Quando o jogo fecha, o sistema salva o consenso entre mandante, empate e visitante para aquela partida.
              </p>
            </article>
            <article className="dg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">Corte</p>
              <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Qualquer amostra / 30%</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                O consenso usa a quantidade de palpites que houver, e a zebra conta quando o desfecho escolhido tinha no maximo 30%.
              </p>
            </article>
            <article className="dg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">Badge</p>
              <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Tem que acertar o desfecho</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                A conquista sobe quando voce acerta a zebra no resultado final. Acerto parcial de gols nao incrementa o contador.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="dg-surface p-5">
            <SectionHeader
              eyebrow="Desempate"
              title="Como a liga decide quem fica na frente"
              description="Quando duas pessoas empatam em pontos, a classificação segue esta ordem."
            />

            <div className="mt-5 space-y-3">
              {RANKING_TIEBREAKERS.map((rule, index) => (
                <div key={rule} className="flex items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(22,129,255,0.1)] text-sm font-black text-[var(--accent-strong)]">
                    {index + 1}
                  </span>
                  <p className="text-sm font-bold text-[var(--ink)]">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="dg-surface p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">Atalho útil</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">Onde você vê isso ao vivo</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Acompanhe o total na sua liga, revise o breakdown de partidas encerradas e compare o peso dos especiais sem
              sair do fluxo principal.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/leagues" className="dg-button-secondary">
                Abrir ligas
              </Link>
              <Link href="/outrights" className="dg-button-secondary">
                Ver especiais
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </PageShell>
  )
}
