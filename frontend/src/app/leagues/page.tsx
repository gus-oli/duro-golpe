import { cookies } from 'next/headers'
import Link from 'next/link'

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
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minhas Ligas</h1>
        <div className="flex gap-2">
          <Link
            href="/leagues/join"
            className="min-h-[48px] px-4 py-3 border border-green-600 text-green-700 rounded-lg font-medium hover:bg-green-50 flex items-center"
          >
            Entrar com código
          </Link>
          <Link
            href="/leagues/new"
            className="min-h-[48px] px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center"
          >
            Nova Liga
          </Link>
        </div>
      </div>

      {leagues.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Você ainda não faz parte de nenhuma liga.</p>
          <p className="text-sm">Crie uma liga ou entre com um código de convite.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {leagues.map((league) => (
            <li key={league.id}>
              <Link
                href={`/leagues/${league.id}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{league.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Código: <span className="font-mono">{league.inviteCode}</span>
                  </p>
                </div>
                <span className="text-gray-400 text-xl" aria-hidden>›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
