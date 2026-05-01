import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MuralFeed } from '@/components/Mural/MuralFeed'

interface Post {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: string
}

const API = process.env['API_URL'] ?? 'http://localhost:3001'

async function getInitialPosts(
  leagueId: string,
  matchId: string,
  token: string,
): Promise<Post[] | null> {
  try {
    const res = await fetch(
      `${API}/api/v1/leagues/${leagueId}/matches/${matchId}/mural?limit=50`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    )
    if (res.status === 403) return null
    if (!res.ok) return []
    const data = (await res.json()) as { posts: Post[] }
    return data.posts
  } catch {
    return []
  }
}

async function getCurrentUserId(token: string): Promise<string | null> {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64url').toString()) as { sub?: string }
    return payload.sub ?? null
  } catch {
    return null
  }
}

export default async function MuralPage({
  params,
}: {
  params: Promise<{ matchId: string; leagueId: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const { matchId, leagueId } = await params

  const [posts, currentUserId] = await Promise.all([
    getInitialPosts(leagueId, matchId, token),
    getCurrentUserId(token),
  ])

  if (posts === null) redirect(`/leagues/${leagueId}`)

  return (
    <main className="max-w-2xl mx-auto px-4 py-4">
      <h1 className="text-xl font-bold mb-4">Mural de Resenha</h1>
      <MuralFeed
        leagueId={leagueId}
        matchId={matchId}
        initialPosts={posts}
        currentUserId={currentUserId ?? ''}
        token={token}
      />
    </main>
  )
}
