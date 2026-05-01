import Link from 'next/link'
import { HeroSection, PageShell, SectionHeader } from '@/components/ui/Primitives'

export default function HomePage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <HeroSection
          eyebrow="Copa do Mundo 2026"
          title="Duro Golpe"
          actions={
            <>
              <Link href="/matches" className="dg-button-primary">
                Ver Partidas
              </Link>
              <Link href="/login" className="dg-button-secondary">
                Entrar
              </Link>
            </>
          }
          aside={
            <div className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Matchday</span>
                <span className="rounded-md bg-[var(--gold)] px-2 py-1 text-xs font-black text-[#4a3100]">LIVE</span>
              </div>
              <div className="py-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                  <span className="font-[var(--font-display)] text-3xl font-black">BRA</span>
                  <span className="dg-score-tile text-2xl">2 - 0</span>
                  <span className="font-[var(--font-display)] text-3xl font-black">FRA</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-2/3 rounded-full bg-[linear-gradient(90deg,var(--pitch),var(--gold))]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-white/72">
                <span>Palpites</span>
                <span>Ligas</span>
                <span>Especiais</span>
              </div>
            </div>
          }
        >
          <p>
            Palpites, ligas privadas, ranking ao vivo e apostas especiais para acompanhar a Copa com cara
            de transmissao grande.
          </p>
        </HeroSection>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ['Palpites de placar', 'Crave o resultado antes da bola rolar e acompanhe seus pontos em tempo real.'],
            ['Ligas com a galera', 'Monte uma tabela privada para disputar posicao rodada a rodada.'],
            ['Apostas especiais', 'Campeao, artilheiro, finalistas e mercados longos valendo pontos pesados.'],
          ].map(([title, description]) => (
            <div key={title} className="dg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--pitch-dark)]">Duro Golpe</p>
              <h2 className="mt-2 text-xl font-black text-[var(--ink)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </section>

        <section className="dg-surface p-5 sm:p-6">
          <SectionHeader
            eyebrow="Proximo passo"
            title="Entre no calendario da Copa"
            description="A home abre o clima, mas o jogo mesmo comeca na agenda: escolha uma partida, mande o placar e veja a disputa andar."
            actions={
              <Link href="/matches" className="dg-button-primary">
                Abrir Agenda
              </Link>
            }
          />
        </section>
      </div>
    </PageShell>
  )
}
