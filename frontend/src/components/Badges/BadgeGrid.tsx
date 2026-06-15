'use client'

import { useId, useState } from 'react'
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
  const [openBadgeType, setOpenBadgeType] = useState<string | null>(null)
  const gridId = useId()

  if (badges.length === 0) {
    return <p className="text-sm italic text-gray-400">Nenhuma conquista ainda</p>
  }

  const openBadge = badges.find((badge) => badge.type === openBadgeType) ?? null
  const popoverId = openBadge ? `${gridId}-${openBadge.type.toLowerCase()}-badge-popover` : undefined

  return (
    <div className="relative">
      <ul className="flex flex-wrap items-center gap-1.5" aria-label="Conquistas">
        {badges.map((badge) => {
          const isOpen = badge.type === openBadgeType

          return (
            <li key={badge.type}>
              <button
                type="button"
                className="relative rounded-full outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                onClick={() => setOpenBadgeType((current) => (current === badge.type ? null : badge.type))}
                aria-label={`Ver conquista ${badge.labelPt}`}
                aria-expanded={isOpen}
                aria-controls={isOpen ? popoverId : undefined}
              >
                <BadgeIcon iconKey={badge.iconKey} labelPt={badge.labelPt} size="sm" />
                {badge.type === 'ZEBRA_HUNTER' && badge.zebraCount != null && badge.zebraCount > 1 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--night)] px-1 text-[9px] font-black leading-none text-white">
                    {badge.zebraCount}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {openBadge && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={openBadge.labelPt}
          className="mt-2 w-fit max-w-[min(18rem,100%)] rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-left shadow-[0_14px_34px_rgba(10,19,36,0.16)]"
        >
          <div className="flex items-start gap-3">
            <BadgeIcon iconKey={openBadge.iconKey} labelPt={openBadge.labelPt} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[var(--ink)]">{openBadge.labelPt}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{openBadge.descriptionPt}</p>
              {openBadge.type === 'ZEBRA_HUNTER' && openBadge.zebraCount != null && openBadge.zebraCount > 1 && (
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
                  {openBadge.zebraCount} zebras acertadas
                </p>
              )}
            </div>
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              onClick={() => setOpenBadgeType(null)}
              aria-label="Fechar conquista"
            >
              x
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
