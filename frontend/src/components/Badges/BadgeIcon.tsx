interface BadgeIconProps {
  iconKey: string
  labelPt: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xl',
  md: 'w-12 h-12 text-3xl',
  lg: 'w-16 h-16 text-4xl',
}

const ICON_MAP: Record<string, string> = {
  'badge-primeira-cravada': '1x',
  'badge-hat-trick-exato': '3x',
  'badge-rei-do-saldo': '+5',
  'badge-gol-de-honra': 'pts',
  'badge-regularidade': '10',
  'badge-volta-por-cima': 'UP',
  'badge-mestre': '🏆',
  'badge-pe-frio': '🧊',
  'badge-zebra': '🦓',
}

export function BadgeIcon({ iconKey, labelPt, size = 'md' }: BadgeIconProps) {
  const emoji = ICON_MAP[iconKey] ?? '🏅'
  const sizeClass = SIZE_MAP[size]

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-yellow-50 border-2 border-yellow-200 ${sizeClass}`}
      role="img"
      aria-label={labelPt}
      title={labelPt}
    >
      {emoji}
    </span>
  )
}
