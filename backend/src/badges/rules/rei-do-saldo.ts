import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardReiDoSaldo } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const REI_DO_SALDO_RULE: BadgeRule = {
  badgeType: 'REI_DO_SALDO',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardReiDoSaldo(ctx)) return null
    return awardBadgeOnce(ctx, 'REI_DO_SALDO')
  },
}
