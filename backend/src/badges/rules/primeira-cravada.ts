import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardPrimeiraCravada } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const PRIMEIRA_CRAVADA_RULE: BadgeRule = {
  badgeType: 'PRIMEIRA_CRAVADA',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardPrimeiraCravada(ctx)) return null
    return awardBadgeOnce(ctx, 'PRIMEIRA_CRAVADA')
  },
}
