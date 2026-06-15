import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EmptyState, PageShell, SectionHeader } from '@/components/ui/Primitives'

interface League {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  createdAt: string
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getMyLeagues(token: string): Promise<{ leagues: League[]; unauthorized: boolean }> {
  try {
    const res = await fetch(`${API}/api/v1/leagues`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.status === 401) return { leagues: [], unauthorized: true }
    if (!res.ok) return { leagues: [], unauthorized: false }
    const data = (await res.json()) as { leagues: League[] }
    return { leagues: data.leagues, unauthorized: false }
  } catch {
    return { leagues: [], unauthorized: false }
  }
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { sub?: string }
    return decoded.sub ?? null
  } catch {
    return null
  }
}

export default async function LeaguesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  if (!token) {
    redirect('/login?from=/leagues')
  }

  const { leagues, unauthorized } = await getMyLeagues(token)
  const userId = getUserIdFromToken(token)

  if (unauthorized) {
    redirect('/login?from=/leagues')
  }

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
                      {league.createdBy === userId && (
                        <p className="mt-2 inline-flex rounded-md bg-[rgba(12,143,79,0.12)] px-2 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--pitch-dark)]">
                          Criada por você
                        </p>
                      )}
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
