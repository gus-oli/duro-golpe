import type { FastifyInstance } from 'fastify'
import oauth2 from '@fastify/oauth2'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'
import { config } from '../config.js'

interface GoogleUserInfo {
  sub: string
  email: string
  name: string
  picture?: string
}

export async function oauthRoutes(app: FastifyInstance): Promise<void> {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    app.log.warn('[OAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled')
    return
  }

  await app.register(oauth2, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: config.GOOGLE_CLIENT_ID,
        secret: config.GOOGLE_CLIENT_SECRET,
      },
      auth: oauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/api/v1/auth/google',
    callbackUri: `${config.BASE_URL}/api/v1/auth/google/callback`,
    scope: ['profile', 'email'],
  })

  app.get('/api/v1/auth/google/callback', async (request, reply) => {
    const tokenResult = await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    const accessToken = tokenResult.token.access_token as string

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const googleUser = (await userInfoRes.json()) as GoogleUserInfo

    const [existing] = await db.select().from(users).where(eq(users.googleSub, googleUser.sub)).limit(1)

    let userId: string

    if (existing) {
      userId = existing.id
    } else {
      const [emailUser] = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1)

      if (emailUser) {
        await db.update(users).set({ googleSub: googleUser.sub }).where(eq(users.id, emailUser.id))
        userId = emailUser.id
      } else {
        const [created] = await db
          .insert(users)
          .values({
            email: googleUser.email,
            displayName: googleUser.name,
            googleSub: googleUser.sub,
            avatarUrl: googleUser.picture ?? null,
          })
          .returning({ id: users.id })
        userId = created!.id
      }
    }

    const jwt = app.jwt.sign({ sub: userId }, { expiresIn: '7d' })

    return reply.redirect(`${config.FRONTEND_URL}/api/auth/google/callback?token=${jwt}`)
  })
}
