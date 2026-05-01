interface LockOverlayProps {
  isLocked: boolean
}

export function LockOverlay({ isLocked }: LockOverlayProps) {
  if (!isLocked) return null

  return (
    <div
      className="flex items-center justify-center gap-2 py-4 px-4 bg-orange-50 border-t border-orange-100 min-h-[48px]"
      role="status"
      aria-label="Palpites encerrados para esta partida"
      aria-live="polite"
    >
      <span className="text-lg" aria-hidden="true">🔒</span>
      <span className="font-medium text-orange-700">Palpites encerrados</span>
    </div>
  )
}
