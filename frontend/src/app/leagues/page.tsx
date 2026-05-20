import { cookies } from 'next/headers'
import Link from 'next/link'
import { EmptyState, PageShell, SectionHeader } from '@/components/ui/Primitives'

interface League {
  id: string
  name: string
  inviteCode: string
  createdAt: string
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

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

export default async function LeaguesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const leagues = await getMyLeagues(token)

  return (
    <PageShell>
      <div className="space-y-6">
        <section className="dg-panel p-5 sm:p-6">
          <SectionHeader
            eyebrow="Competicao privada"
            title="Minhas Ligas"
            description="A tabela onde cada placar pesa. Crie uma liga, chame a galera e use a competicao como eixo do produto."
            actions={
              <>
                <Link href="/leagues/join" className="dg-button-secondary">
                  Entrar com codigo
                </Link>
                <Link href="/leagues/new" className="dg-button-primary">
                  Nova Liga
                </Link>
              </>
            }
          />
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Link href="/matches" className="dg-card-interactive block p-4">
            <p className="dg-eyebrow">Partidas</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Voltar para agenda</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Entre na rodada e veja onde sua liga pode virar.</p>
          </Link>
          <Link href="/outrights" className="dg-card-interactive block p-4">
            <p className="dg-eyebrow">Especiais</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Abrir mercados</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Especiais tambem mexem na disputa total.</p>
          </Link>
          <Link href="/profile" className="dg-card-interactive block p-4">
            <p className="dg-eyebrow">Conta</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">Ver meu resumo</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Pontuacao, ligas e atalhos do seu fluxo.</p>
          </Link>
        </section>

        {leagues.length === 0 ? (
          <EmptyState
            title="Você ainda não está em uma liga"
            description="Crie uma liga ou entre com um código para transformar seus palpites em disputa."
            action={
              <Link href="/leagues/new" className="dg-button-primary">
                Criar Liga
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {leagues.map((league) => (
              <li key={league.id}>
                <Link href={`/leagues/${league.id}`} className="dg-card-interactive block p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--pitch-dark)]">Liga</p>
                      <h2 className="mt-2 truncate text-2xl font-black text-[var(--ink)]">{league.name}</h2>
                      <p className="mt-3 text-sm font-bold text-[var(--muted)]">
                        Codigo: <span className="font-mono text-[var(--night)]">{league.inviteCode}</span>
                      </p>
                    </div>
                    <span className="rounded-md bg-[rgba(246,196,69,0.24)] px-3 py-2 text-sm font-black text-[#7c4a00]">
                      Ver
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
