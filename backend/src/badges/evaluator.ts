import { createClient } from 'redis'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { badges, userBadges } from '../db/schema/index.js'
import { and, eq } from 'drizzle-orm'
import type { BadgeEvaluationContext, BadgeRule } from './types.js'
import { O_MESTRE_RULE } from './rules/o-mestre.js'
import { PE_FRIO_RULE } from './rules/pe-frio.js'
import { ZEBRA_HUNTER_RULE } from './rules/zebra-hunter.js'
import { PRIMEIRA_CRAVADA_RULE } from './rules/primeira-cravada.js'
import { HAT_TRICK_EXATO_RULE } from './rules/hat-trick-exato.js'
import { REI_DO_SALDO_RULE } from './rules/rei-do-saldo.js'
import { GOL_DE_HONRA_RULE } from './rules/gol-de-honra.js'
import { REGULARIDADE_RULE } from './rules/regularidade.js'
import { VOLTA_POR_CIMA_RULE } from './rules/volta-por-cima.js'
import { sendToUser } from '../realtime/user-sessions.js'

export const BADGE_REGISTRY: BadgeRule[] = [
  O_MESTRE_RULE,
  PE_FRIO_RULE,
  ZEBRA_HUNTER_RULE,
  PRIMEIRA_CRAVADA_RULE,
  HAT_TRICK_EXATO_RULE,
  REI_DO_SALDO_RULE,
  GOL_DE_HONRA_RULE,
  REGULARIDADE_RULE,
  VOLTA_POR_CIMA_RULE,
]

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
      await broadcastBadgeAwarded(ctx.userId, rule.badgeType)
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
