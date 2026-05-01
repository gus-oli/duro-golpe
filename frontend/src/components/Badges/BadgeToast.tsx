'use client'

import { useEffect } from 'react'
import { BadgeIcon } from './BadgeIcon'

interface BadgeToastProps {
  badge: {
    type: string
    labelPt: string
    descriptionPt: string
    iconKey: string
    awardedAt: string
  }
  onDismiss: () => void
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white border border-yellow-300 shadow-lg rounded-2xl px-4 py-3 max-w-sm animate-slide-in"
    >
      <BadgeIcon iconKey={badge.iconKey} labelPt={badge.labelPt} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">Nova Conquista!</p>
        <p className="font-bold text-gray-900 text-sm">{badge.labelPt}</p>
        <p className="text-xs text-gray-500 leading-tight">{badge.descriptionPt}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="min-h-[48px] min-w-[48px] flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  )
}
