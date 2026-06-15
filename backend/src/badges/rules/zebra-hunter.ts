import { db } from '../../db/index.js'
import { userBadges } from '../../db/schema/index.js'
import { and, eq, sql } from 'drizzle-orm'
import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardZebraHunter } from '../badge-rule-utils.js'

export const ZEBRA_HUNTER_RULE: BadgeRule = {
  badgeType: 'ZEBRA_HUNTER',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardZebraHunter(ctx)) return null

    // Try to insert first (first-time award)
    const inserted = await db
      .insert(userBadges)
      .values({
        userId: ctx.userId,
        badgeType: 'ZEBRA_HUNTER',
        triggerMatchId: ctx.matchId,
        zebraCount: 1,
      })
      .onConflictDoNothing()
      .returning({ id: userBadges.id })

    if (inserted.length > 0) return 'awarded'

    // Already awarded — increment zebra_count
    await db
      .update(userBadges)
      .set({ zebraCount: sql`${userBadges.zebraCount} + 1` })
      .where(and(eq(userBadges.userId, ctx.userId), eq(userBadges.badgeType, 'ZEBRA_HUNTER')))

    return 'incremented'
  },
}
