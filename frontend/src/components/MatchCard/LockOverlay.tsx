interface LockOverlayProps {
  isLocked: boolean
}

export function LockOverlay({ isLocked }: LockOverlayProps) {
  if (!isLocked) return null

  return (
    <div
      className="mx-4 mb-4 flex min-h-touch items-center justify-center gap-2 rounded-md border border-[rgba(143,61,18,0.2)] bg-[rgba(246,196,69,0.18)] px-4 py-3 text-sm font-bold text-[#8f3d12]"
      role="status"
      aria-label="Palpites encerrados para esta partida"
      aria-live="polite"
    >
      <span aria-hidden="true">LOCK</span>
      <span>Palpites encerrados</span>
    </div>
  )
}
