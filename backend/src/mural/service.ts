import { db } from '../db/index.js'
import { muralPosts, leagueMemberships, users } from '../db/schema/index.js'
import { and, asc, desc, eq, lt } from 'drizzle-orm'
import { createClient } from 'redis'
import { config } from '../config.js'
import type { MuralPost } from '../db/schema/mural-posts.js'

let redisPublisher: ReturnType<typeof createClient> | null = null

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

export interface MuralPostResponse {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: string
}

export async function createPost(
  userId: string,
  leagueId: string,
  matchId: string,
  content: string,
): Promise<MuralPost> {
  await assertMembership(userId, leagueId)

  if (!content || content.length === 0) {
    const err = Object.assign(new Error('Conteúdo não pode ser vazio'), { statusCode: 400 })
    throw err
  }
  if (content.length > 500) {
    const err = Object.assign(new Error('Conteúdo não pode exceder 500 caracteres'), { statusCode: 400 })
    throw err
  }

  const [post] = await db.insert(muralPosts).values({ leagueId, matchId, userId, content }).returning()

  const [author] = await db.select({ displayName: users.displayName, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, userId)).limit(1)

  const publisher = await getPublisher()
  const channelPayload = {
    type: 'mural:post:new',
    leagueId,
    matchId,
    post: {
      id: post!.id,
      userId,
      displayName: author?.displayName ?? '',
      avatarUrl: author?.avatarUrl ?? null,
      content: post!.content,
      createdAt: post!.createdAt.toISOString(),
    },
  }
  await publisher.publish(`mural:${leagueId}:${matchId}`, JSON.stringify(channelPayload))

  return post!
}

export async function getPosts(
  userId: string,
  leagueId: string,
  matchId: string,
  limit = 50,
  before?: string,
): Promise<{ posts: MuralPostResponse[]; hasMore: boolean }> {
  await assertMembership(userId, leagueId)

  const safeLimitNum = Math.min(limit, 100)

  const conditions = [
    eq(muralPosts.leagueId, leagueId),
    eq(muralPosts.matchId, matchId),
    eq(muralPosts.isHidden, false),
  ]

  if (before) {
    conditions.push(lt(muralPosts.createdAt, new Date(before)))
  }

  const rows = await db
    .select({
      id: muralPosts.id,
      userId: muralPosts.userId,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      content: muralPosts.content,
      createdAt: muralPosts.createdAt,
    })
    .from(muralPosts)
    .innerJoin(users, eq(muralPosts.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(muralPosts.createdAt))
    .limit(safeLimitNum + 1)

  const hasMore = rows.length > safeLimitNum
  const posts = rows.slice(0, safeLimitNum).map((r) => ({
    ...r,
    avatarUrl: r.avatarUrl ?? null,
    createdAt: r.createdAt.toISOString(),
  }))

  return { posts, hasMore }
}
