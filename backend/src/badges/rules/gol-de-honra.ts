import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardGolDeHonra } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const GOL_DE_HONRA_RULE: BadgeRule = {
  badgeType: 'GOL_DE_HONRA',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardGolDeHonra(ctx)) return null
    return awardBadgeOnce(ctx, 'GOL_DE_HONRA')
  },
}
