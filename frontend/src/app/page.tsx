import Link from 'next/link'
import { cookies } from 'next/headers'
import { HeroSection, PageShell, SectionHeader, StatusPill } from '@/components/ui/Primitives'
import { formatAppDate, formatAppDateTime, getAppDateKey } from '@/lib/date-time'

interface Match {
  id: string
  kickoffTime: string
  stage: string
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeTeam: { name: string; fifaCode: string }
  awayTeam: { name: string; fifaCode: string }
}

interface League {
  id: string
  name: string
}

interface OutrightMarket {
  id: string
  status: 'OPEN' | 'LOCKED' | 'RESOLVED'
}

interface UserTotal {
  totalPoints: number
}

interface AccountProfile {
  id: string
  email: string
  displayName: string
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${API}/api/v1/matches`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { matches: Match[] }
    return data.matches
  } catch {
    return []
  }
}

async function getMyLeagues(token: string): Promise<League[]> {
  try {
    const res = await fetch(`${API}/api/v1/leagues`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { leagues: League[] }
    return data.leagues
  } catch {
    return []
  }
}

async function getOutrights(token: string): Promise<OutrightMarket[]> {
  try {
    const res = await fetch(`${API}/api/v1/outrights`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { markets: OutrightMarket[] }
    return data.markets
  } catch {
    return []
  }
}

async function getMyProfile(token: string): Promise<AccountProfile | null> {
  try {
    const res = await fetch(`${API}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { user: AccountProfile }
    return data.user
  } catch {
    return null
  }
}

async function getUserTotal(userId: string, token: string): Promise<UserTotal | null> {
  try {
    const res = await fetch(`${API}/api/v1/users/${userId}/score`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<UserTotal>
  } catch {
    return null
  }
}

function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort((left, right) => new Date(left.kickoffTime).getTime() - new Date(right.kickoffTime).getTime())
}

function getNextRelevantMatches(matches: Match[]): Match[] {
  const sorted = sortMatches(matches)
  const actionable =
    sorted.find((match) => match.status === 'LIVE') ??
    sorted.find((match) => match.status === 'SCHEDULED' || match.status === 'LOCKED') ??
    sorted[0]

  if (!actionable) {
    return []
  }

  const targetDate = getAppDateKey(actionable.kickoffTime)
  return sorted.filter((match) => getAppDateKey(match.kickoffTime) === targetDate)
}

function getActionLabel(status: Match['status']) {
  if (status === 'SCHEDULED') return 'Palpitar'
  if (status === 'LOCKED') return 'Fechado'
  if (status === 'LIVE') return 'Ao vivo'
  return 'Resultado'
}

async function AuthenticatedHome({ token }: { token: string }) {
  const profile = await getMyProfile(token)
  const [matches, leagues, markets, myTotal] = await Promise.all([
    getMatches(),
    getMyLeagues(token),
    getOutrights(token),
    profile ? getUserTotal(profile.id, token) : Promise.resolve(null),
  ])

  const nextMatches = getNextRelevantMatches(matches)
  const liveCount = matches.filter((match) => match.status === 'LIVE').length
  const openCount = matches.filter((match) => match.status === 'SCHEDULED').length
  const openMarkets = markets.filter((market) => market.status === 'OPEN').length
  const displayName = profile?.displayName ?? 'jogador'

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-panel p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="dg-eyebrow">Painel do jogador</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--ink)] sm:text-4xl">Bom te ver de volta, {displayName}.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Entre no fluxo certo da rodada: abra partidas, acompanhe sua liga e feche especiais antes do lock.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={liveCount > 0 ? 'live' : 'resolved'}>{liveCount} ao vivo</StatusPill>
              <StatusPill tone="open">{openCount} abertas</StatusPill>
              <StatusPill tone="resolved">{myTotal?.totalPoints ?? 0} pts</StatusPill>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Link href="/matches" className="dg-card-interactive block p-4">
              <p className="dg-eyebrow">Partidas</p>
              <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Abrir agenda</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Veja jogos, travas e o proximo placar para mandar.</p>
            </Link>
            <Link href="/leagues" className="dg-card-interactive block p-4">
              <p className="dg-eyebrow">Ligas</p>
              <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Minha disputa</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {leagues.length > 0 ? `${leagues.length} ligas para acompanhar.` : 'Entre em uma liga para transformar palpite em briga de tabela.'}
              </p>
            </Link>
            <Link href="/outrights" className="dg-card-interactive block p-4">
              <p className="dg-eyebrow">Especiais</p>
              <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Mercados longos</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {openMarkets > 0 ? `${openMarkets} mercados ainda abertos.` : 'Veja o status dos mercados de longo prazo.'}
              </p>
            </Link>
            <Link href="/simulador" className="dg-card-interactive block p-4">
              <p className="dg-eyebrow">Simulador</p>
              <h2 className="mt-2 text-xl font-black text-[var(--ink)]">Minha Copa</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Monte grupos, terceiros e mata-mata com o chaveamento oficial da Copa 2026.
              </p>
            </Link>
          </div>
        </section>

        <section className="dg-surface p-5 sm:p-6">
          <SectionHeader
            eyebrow="Proxima acao"
            title={
              nextMatches[0]
                ? formatAppDate(nextMatches[0].kickoffTime, {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  })
                : 'Acompanhe a rodada'
            }
            description={
              nextMatches[0]
                ? 'Todos os jogos da próxima janela relevante, para você resolver a rodada em bloco.'
                : 'A agenda continua sendo o centro do seu dia de Copa.'
            }
          />

          {nextMatches.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-5 text-sm text-[var(--muted)]">
              Nenhuma partida carregada no momento.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {nextMatches.map((match) => (
                <Link key={match.id} href={`/matches/${match.id}`} className="dg-card-interactive block p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">{match.stage}</p>
                      <h2 className="mt-2 text-xl font-black text-[var(--ink)]">
                        {match.homeTeam.name} x {match.awayTeam.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {formatAppDateTime(match.kickoffTime, {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <StatusPill tone={match.status === 'LIVE' ? 'live' : match.status === 'SCHEDULED' ? 'open' : match.status === 'LOCKED' ? 'locked' : 'resolved'}>
                      {getActionLabel(match.status)}
                    </StatusPill>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}

function PublicHome() {
  return (
    <PageShell>
      <div className="space-y-6">
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
            <div className="dg-subtle-card p-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Companion da rodada</span>
                <StatusPill tone="live">Live</StatusPill>
              </div>
              <div className="py-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                  <span className="font-[var(--font-display)] text-2xl font-black text-[var(--ink)]">Brasil</span>
                  <span className="dg-score-tile text-2xl">2 - 0</span>
                  <span className="font-[var(--font-display)] text-2xl font-black text-[var(--ink)]">França</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <span>Palpites</span>
                <span>Ligas</span>
                <span>Especiais</span>
              </div>
            </div>
          }
        >
          <p>Palpites, ligas privadas, ranking ao vivo e especiais para acompanhar a Copa sem interface pesada demais.</p>
        </HeroSection>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ['Partidas e placares', 'Agenda rápida para abrir jogo, bater o olho e mandar o placar.'],
            ['Ligas com ranking vivo', 'Disputa privada com pontos, badges e a tabela sempre a vista.'],
            ['Especiais que pesam', 'Campeão, finalistas e mercados longos para mexer na classificação.'],
          ].map(([title, description]) => (
            <div key={title} className="dg-card p-5">
              <p className="dg-eyebrow">Duro Golpe</p>
              <h2 className="mt-2 text-xl font-black text-[var(--ink)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  )
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? null

  if (token) {
    return <AuthenticatedHome token={token} />
  }

  return <PublicHome />
}
