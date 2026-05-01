import { db } from '../../db/index.js'
import { userBadges } from '../../db/schema/index.js'
import { sql } from 'drizzle-orm'
import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardOMestre } from '../badge-rule-utils.js'

export const O_MESTRE_RULE: BadgeRule = {
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardOMestre(ctx)) return null

    const result = await db
      .insert(userBadges)
      .values({
        userId: ctx.userId,
        badgeType: 'O_MESTRE',
        triggerMatchId: ctx.matchId,
        zebraCount: 1,
      })
      .onConflictDoNothing()
      .returning({ id: userBadges.id })

    return result.length > 0 ? 'awarded' : null
  },
}
