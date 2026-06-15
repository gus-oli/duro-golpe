interface BadgeIconProps {
  iconKey: string
  labelPt: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-11 w-11 text-xs',
  lg: 'h-14 w-14 text-sm',
}

const BADGE_STYLE: Record<string, { mark: string; className: string }> = {
  'badge-mestre': {
    mark: 'OM',
    className: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  'badge-pe-frio': {
    mark: 'PF',
    className: 'border-sky-300 bg-sky-50 text-sky-800',
  },
  'badge-zebra': {
    mark: 'ZH',
    className: 'border-zinc-300 bg-zinc-50 text-zinc-800',
  },
  'badge-primeira-cravada': {
    mark: 'PC',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  },
  'badge-hat-trick-exato': {
    mark: 'HT',
    className: 'border-violet-300 bg-violet-50 text-violet-800',
  },
  'badge-rei-do-saldo': {
    mark: 'RS',
    className: 'border-blue-300 bg-blue-50 text-blue-800',
  },
  'badge-gol-de-honra': {
    mark: 'GH',
    className: 'border-lime-300 bg-lime-50 text-lime-800',
  },
  'badge-regularidade': {
    mark: 'RG',
    className: 'border-teal-300 bg-teal-50 text-teal-800',
  },
  'badge-volta-por-cima': {
    mark: 'VC',
    className: 'border-rose-300 bg-rose-50 text-rose-800',
  },
}

export function BadgeIcon({ iconKey, labelPt, size = 'md' }: BadgeIconProps) {
  const badgeStyle = BADGE_STYLE[iconKey] ?? {
    mark: 'BD',
    className: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  }
  const sizeClass = SIZE_MAP[size]

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-black leading-none shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] ${sizeClass} ${badgeStyle.className}`}
      role="img"
      aria-label={labelPt}
      title={labelPt}
    >
      {badgeStyle.mark}
    </span>
  )
}
