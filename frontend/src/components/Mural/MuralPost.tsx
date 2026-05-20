import type { MuralPostItem } from './types'

interface MuralPostProps extends MuralPostItem {
  currentUserId?: string
  isFresh?: boolean
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'agora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return new Date(isoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function MuralPost({
  userId,
  displayName,
  avatarUrl,
  content,
  createdAt,
  matchContext,
  currentUserId,
  isFresh = false,
}: MuralPostProps) {
  const isOwn = userId === currentUserId
  const safeDisplayName = displayName?.trim() || 'Jogador'

  return (
    <li
      className={`flex gap-3 rounded-2xl px-2 py-1 transition-colors duration-700 ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      } ${isFresh ? 'bg-[rgba(48,119,255,0.08)]' : 'bg-transparent'}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={safeDisplayName}
          className="mt-1 h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(12,143,79,0.13)] text-sm font-bold text-[var(--pitch-dark)]">
          {safeDisplayName[0]?.toUpperCase()}
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <p className="text-xs font-medium text-[var(--muted)]">{isOwn ? 'Voce' : safeDisplayName}</p>

        {matchContext && (
          <span className="dg-chip text-[10px] uppercase tracking-[0.08em]">
            Sobre {matchContext.label}
          </span>
        )}

        <div
          className={`rounded-2xl px-3 py-2 text-sm break-words ${
            isOwn
              ? 'rounded-tr-sm bg-[var(--accent)] text-white'
              : 'rounded-tl-sm bg-[var(--surface-muted)] text-[var(--ink)]'
          }`}
        >
          {content}
        </div>

        <p className="text-xs text-[var(--muted)]">{relativeTime(createdAt)}</p>
      </div>
    </li>
  )
}
