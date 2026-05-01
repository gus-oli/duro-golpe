import { BadgeIcon } from './BadgeIcon'

interface Badge {
  type: string
  labelPt: string
  descriptionPt: string
  iconKey: string
  zebraCount?: number | null
}

interface BadgeGridProps {
  badges: Badge[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">Nenhuma conquista ainda</p>
    )
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Conquistas">
      {badges.map((badge) => (
        <li key={badge.type}>
          <div className="flex flex-col items-center gap-1">
            <BadgeIcon iconKey={badge.iconKey} labelPt={badge.labelPt} size="sm" />
            <span className="text-xs text-gray-600 max-w-[60px] text-center leading-tight">
              {badge.labelPt}
              {badge.type === 'ZEBRA_HUNTER' && badge.zebraCount != null && badge.zebraCount > 1 && (
                <span className="block text-xs text-yellow-600 font-medium">×{badge.zebraCount}</span>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
