import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardPeFrio } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const PE_FRIO_RULE: BadgeRule = {
  badgeType: 'PE_FRIO',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardPeFrio(ctx)) return null
    return awardBadgeOnce(ctx, 'PE_FRIO')
  },
}
