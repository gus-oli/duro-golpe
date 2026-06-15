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
    return <p className="text-sm italic text-gray-400">Nenhuma conquista ainda</p>
  }

  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Conquistas">
      {badges.map((badge) => (
        <li key={badge.type}>
          <div className="relative" title={`${badge.labelPt}: ${badge.descriptionPt}`}>
            <BadgeIcon iconKey={badge.iconKey} labelPt={badge.labelPt} size="sm" />
            {badge.type === 'ZEBRA_HUNTER' && badge.zebraCount != null && badge.zebraCount > 1 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--night)] px-1 text-[9px] font-black leading-none text-white">
                {badge.zebraCount}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
