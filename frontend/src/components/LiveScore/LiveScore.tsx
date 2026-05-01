'use client'

interface LiveScoreProps {
  home?: number | null
  away?: number | null
}

export function LiveScore({ home, away }: LiveScoreProps) {
  if (home === null || home === undefined || away === null || away === undefined) {
    return <span className="text-2xl font-bold text-gray-300">vs</span>
  }

  return (
    <span
      className="text-4xl font-bold transition-all duration-300"
      aria-live="polite"
      aria-label={`Placar: ${home} a ${away}`}
    >
      {home} â€“ {away}
    </span>
  )
}
