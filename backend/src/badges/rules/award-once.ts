import { db } from '../../db/index.js'
import { userBadges } from '../../db/schema/index.js'
import type { BadgeEvaluationContext, BadgeEvaluationResult, BadgeType } from '../types.js'

export async function awardBadgeOnce(ctx: BadgeEvaluationContext, badgeType: BadgeType): Promise<BadgeEvaluationResult> {
  const result = await db
    .insert(userBadges)
    .values({
      userId: ctx.userId,
      badgeType,
      triggerMatchId: ctx.matchId,
      zebraCount: 1,
    })
    .onConflictDoNothing()
    .returning({ id: userBadges.id })

  return result.length > 0 ? 'awarded' : null
}
