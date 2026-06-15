import type { BadgeRule, BadgeEvaluationContext, BadgeEvaluationResult } from '../types.js'
import { shouldAwardHatTrickExato } from '../badge-rule-utils.js'
import { awardBadgeOnce } from './award-once.js'

export const HAT_TRICK_EXATO_RULE: BadgeRule = {
  badgeType: 'HAT_TRICK_EXATO',
  async evaluate(ctx: BadgeEvaluationContext): Promise<BadgeEvaluationResult> {
    if (!shouldAwardHatTrickExato(ctx)) return null
    return awardBadgeOnce(ctx, 'HAT_TRICK_EXATO')
  },
}
