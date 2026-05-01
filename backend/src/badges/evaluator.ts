import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { badges, userBadges } from '../db/schema/index.js'
import { and, eq } from 'drizzle-orm'
import type { BadgeEvaluationContext, BadgeRule } from './types.js'
import { O_MESTRE_RULE } from './rules/o-mestre.js'
import { PE_FRIO_RULE } from './rules/pe-frio.js'
import { ZEBRA_HUNTER_RULE } from './rules/zebra-hunter.js'
import { sendToUser } from '../realtime/user-sessions.js'

export const BADGE_REGISTRY: BadgeRule[] = [O_MESTRE_RULE, PE_FRIO_RULE, ZEBRA_HUNTER_RULE]

async function broadcastBadgeAwarded(userId: string, badgeType: string): Promise<void> {
  const [badge] = await db.select().from(badges).where(eq(badges.type, badgeType)).limit(1)
  if (!badge) return

  const [userBadge] = await db
    .select()
    .from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeType, badgeType)))
    .limit(1)

  sendToUser(userId, {
    type: 'badge:awarded',
    badge: {
      type: badge.type,
      labelPt: badge.labelPt,
      descriptionPt: badge.descriptionPt,
      iconKey: badge.iconKey,
      awardedAt: userBadge?.awardedAt?.toISOString() ?? new Date().toISOString(),
    },
  })
}

export async function runEvaluation(ctx: BadgeEvaluationContext): Promise<void> {
  for (const rule of BADGE_REGISTRY) {
    const result = await rule.evaluate(ctx)
    if (result === 'awarded') {
      const badgeType = rule === O_MESTRE_RULE ? 'O_MESTRE' : rule === PE_FRIO_RULE ? 'PE_FRIO' : 'ZEBRA_HUNTER'
      await broadcastBadgeAwarded(ctx.userId, badgeType)
    }
  }
}

export async function startBadgeSubscriber(): Promise<void> {
  const subscriber = createClient({ url: config.REDIS_URL })
  await subscriber.connect()

  await subscriber.subscribe('badge.evaluate', async (message) => {
    try {
      const payload = JSON.parse(message) as BadgeEvaluationContext & { event?: string }
      await runEvaluation(payload)
    } catch (err) {
      console.error('[BadgeEvaluator] Error processing badge.evaluate event:', err)
    }
  })

  console.info('[BadgeEvaluator] Subscribed to badge.evaluate Redis channel')
}
