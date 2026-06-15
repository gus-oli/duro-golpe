import {
  formatSocialOddsPercentage,
  getOutcomeLabel,
  getSocialOddsMessage,
  shouldShowSocialOddsBars,
  type SocialOddsView,
} from '@/lib/social-odds'

interface SocialOddsSummaryProps {
  odds?: SocialOddsView | null
  homeLabel: string
  awayLabel: string
  variant?: 'compact' | 'detail'
}

export function SocialOddsSummary({ odds, homeLabel, awayLabel, variant = 'compact' }: SocialOddsSummaryProps) {
  if (!odds) return null

  const message = getSocialOddsMessage(odds)
  const isDetail = variant === 'detail'

  return (
    <div className={`rounded-2xl border border-[var(--line)] bg-[rgba(12,34,58,0.035)] ${isDetail ? 'p-4' : 'px-3 py-2'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">Consenso do bolao</p>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
          {odds.source === 'FROZEN' ? 'Fechado' : 'Atual'}
        </span>
      </div>

      {message ? (
        <p className="mt-2 text-xs font-bold text-[var(--muted)]">{message}</p>
      ) : shouldShowSocialOddsBars(odds) ? (
        <div className={isDetail ? 'mt-3 space-y-3' : 'mt-2 space-y-2'}>
          {odds.outcomes.map((item) => (
            <div key={item.outcome} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs">
              <span className="truncate font-bold text-[var(--ink)]">
                {getOutcomeLabel(item.outcome, { home: homeLabel, away: awayLabel })}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-[rgba(12,34,58,0.09)]">
                <span
                  className="block h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${Math.max(4, item.percentage)}%` }}
                />
              </span>
              <span className="text-right font-black text-[var(--ink)]">{formatSocialOddsPercentage(item.percentage)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {isDetail && odds.status === 'AVAILABLE' && (
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          {odds.totalPredictions} palpites no corte. Zebra social: ate {formatSocialOddsPercentage(odds.underdogThresholdPercentage)}.
        </p>
      )}
    </div>
  )
}
