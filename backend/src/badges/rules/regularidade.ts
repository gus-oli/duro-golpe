import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardRegularidade } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const REGULARIDADE_RULE: BadgeRule = {
  badgeType: 'REGULARIDADE',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardRegularidade(ctx)) return null
    return awardBadgeOnce(ctx, 'REGULARIDADE')
  },
}
