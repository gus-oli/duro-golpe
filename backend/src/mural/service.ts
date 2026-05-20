import { and, desc, eq, lt } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { leagueMemberships, matches, muralPosts, teams, users } from '../db/schema/index.js'

let redisPublisher: ReturnType<typeof createClient> | null = null

const homeTeams = alias(teams, 'mural_home_teams')
const awayTeams = alias(teams, 'mural_away_teams')

async function getPublisher(): Promise<ReturnType<typeof createClient>> {
  if (!redisPublisher) {
    redisPublisher = createClient({ url: config.REDIS_URL })
    await redisPublisher.connect()
  }
  return redisPublisher
}

async function assertMembership(userId: string, leagueId: string): Promise<void> {
  const [membership] = await db
    .select()
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.userId, userId),
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.isActive, true),
      ),
    )
    .limit(1)

  if (!membership) {
    const err = Object.assign(new Error('Acesso negado'), { statusCode: 403 })
    throw err
  }
}

interface SerializedPostRow {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: Date
  matchId: string | null
  homeFifaCode: string | null
  awayFifaCode: string | null
}

export interface MuralPostResponse {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: string
  matchContext: {
    matchId: string
    label: string
  } | null
}

function serializePost(row: SerializedPostRow): MuralPostResponse {
  const matchContext =
    row.matchId && row.homeFifaCode && row.awayFifaCode
      ? {
          matchId: row.matchId,
          label: `${row.homeFifaCode} x ${row.awayFifaCode}`,
        }
      : null

  return {
    id: row.id,
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl ?? null,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    matchContext,
  }
}

async function getSerializedPostById(postId: string): Promise<MuralPostResponse | null> {
  const [row] = await db
    .select({
      id: muralPosts.id,
      userId: muralPosts.userId,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      content: muralPosts.content,
      createdAt: muralPosts.createdAt,
      matchId: muralPosts.matchId,
      homeFifaCode: homeTeams.fifaCode,
      awayFifaCode: awayTeams.fifaCode,
    })
    .from(muralPosts)
    .innerJoin(users, eq(muralPosts.userId, users.id))
    .leftJoin(matches, eq(muralPosts.matchId, matches.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(eq(muralPosts.id, postId))
    .limit(1)

  return row ? serializePost(row) : null
}

export async function createPost(
  userId: string,
  leagueId: string,
  content: string,
  matchId?: string,
): Promise<MuralPostResponse> {
  await assertMembership(userId, leagueId)

  const trimmedContent = content.trim()
  if (trimmedContent.length === 0) {
    const err = Object.assign(new Error('Conteudo nao pode ser vazio'), { statusCode: 400 })
    throw err
  }
  if (trimmedContent.length > 500) {
    const err = Object.assign(new Error('Conteudo nao pode exceder 500 caracteres'), { statusCode: 400 })
    throw err
  }

  const [post] = await db
    .insert(muralPosts)
    .values({ leagueId, matchId: matchId ?? null, userId, content: trimmedContent })
    .returning({ id: muralPosts.id })

  if (!post?.id) {
    throw new Error('Não foi possível criar o post do mural.')
  }

  const serializedPost = await getSerializedPostById(post.id)
  if (!serializedPost) {
    throw new Error('Não foi possível carregar o post do mural recém-criado.')
  }

  const publisher = await getPublisher()
  await publisher.publish(
    `mural:${leagueId}`,
    JSON.stringify({
      type: 'mural:post:new',
      leagueId,
      post: serializedPost,
    }),
  )

  return serializedPost
}

export async function getPosts(
  userId: string,
  leagueId: string,
  limit = 50,
  before?: string,
  matchId?: string,
): Promise<{ posts: MuralPostResponse[]; hasMore: boolean }> {
  await assertMembership(userId, leagueId)

  const safeLimitNum = Math.min(limit, 100)
  const conditions = [eq(muralPosts.leagueId, leagueId), eq(muralPosts.isHidden, false)]

  if (before) {
    conditions.push(lt(muralPosts.createdAt, new Date(before)))
  }

  if (matchId) {
    conditions.push(eq(muralPosts.matchId, matchId))
  }

  const rows = await db
    .select({
      id: muralPosts.id,
      userId: muralPosts.userId,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      content: muralPosts.content,
      createdAt: muralPosts.createdAt,
      matchId: muralPosts.matchId,
      homeFifaCode: homeTeams.fifaCode,
      awayFifaCode: awayTeams.fifaCode,
    })
    .from(muralPosts)
    .innerJoin(users, eq(muralPosts.userId, users.id))
    .leftJoin(matches, eq(muralPosts.matchId, matches.id))
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(and(...conditions))
    .orderBy(desc(muralPosts.createdAt))
    .limit(safeLimitNum + 1)

  const hasMore = rows.length > safeLimitNum
  const posts = rows.slice(0, safeLimitNum).map(serializePost)

  return { posts, hasMore }
}

export async function hidePostForActor(
  userId: string,
  leagueId: string,
  postId: string,
): Promise<{ hidden: boolean }> {
  await assertMembership(userId, leagueId)

  const [post] = await db
    .select({
      id: muralPosts.id,
      leagueId: muralPosts.leagueId,
      userId: muralPosts.userId,
      isHidden: muralPosts.isHidden,
    })
    .from(muralPosts)
    .where(eq(muralPosts.id, postId))
    .limit(1)

  if (!post || post.leagueId !== leagueId) {
    const err = Object.assign(new Error('Post do mural nao encontrado'), { statusCode: 404 })
    throw err
  }

  if (post.userId !== userId) {
    const err = Object.assign(new Error('Acesso negado'), { statusCode: 403 })
    throw err
  }

  if (post.isHidden) {
    return { hidden: true }
  }

  await db.update(muralPosts).set({ isHidden: true }).where(eq(muralPosts.id, postId))
  return { hidden: true }
}
