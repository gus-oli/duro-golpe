import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardOMestre } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const O_MESTRE_RULE: BadgeRule = {
  badgeType: 'O_MESTRE',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardOMestre(ctx)) return null
    return awardBadgeOnce(ctx, 'O_MESTRE')
  },
}
