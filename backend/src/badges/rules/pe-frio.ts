import { db } from '../../db/index.js'
import { userBadges } from '../../db/schema/index.js'
import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardPeFrio } from '../badge-rule-utils.js'

export const PE_FRIO_RULE: BadgeRule = {
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardPeFrio(ctx)) return null

    const result = await db
      .insert(userBadges)
      .values({
        userId: ctx.userId,
        badgeType: 'PE_FRIO',
        triggerMatchId: ctx.matchId,
        zebraCount: 1,
      })
      .onConflictDoNothing()
      .returning({ id: userBadges.id })

    return result.length > 0 ? 'awarded' : null
  },
}
