interface MuralPostProps {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: string
  currentUserId?: string
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

export function MuralPost({ userId, displayName, avatarUrl, content, createdAt, currentUserId }: MuralPostProps) {
  const isOwn = userId === currentUserId

  return (
    <li className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold shrink-0 mt-1">
          {displayName[0]?.toUpperCase()}
        </div>
      )}

      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <p className="text-xs text-gray-500">{isOwn ? 'Você' : displayName}</p>
        <div
          className={`px-3 py-2 rounded-2xl text-sm break-words ${
            isOwn ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          {content}
        </div>
        <p className="text-xs text-gray-400">{relativeTime(createdAt)}</p>
      </div>
    </li>
  )
}
