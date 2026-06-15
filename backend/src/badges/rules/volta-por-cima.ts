import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardVoltaPorCima } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const VOLTA_POR_CIMA_RULE: BadgeRule = {
  badgeType: 'VOLTA_POR_CIMA',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardVoltaPorCima(ctx)) return null
    return awardBadgeOnce(ctx, 'VOLTA_POR_CIMA')
  },
}
