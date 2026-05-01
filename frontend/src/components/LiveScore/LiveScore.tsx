'use client'

interface LiveScoreProps {
  home?: number | null
  away?: number | null
}

export function LiveScore({ home, away }: LiveScoreProps) {
  if (home === null || home === undefined || away === null || away === undefined) {
    return <span className="dg-score-tile text-2xl">vs</span>
  }

  return (
    <span
      className="dg-score-tile text-4xl transition-all duration-300"
      aria-live="polite"
      aria-label={`Placar: ${home} a ${away}`}
    >
      {home} - {away}
    </span>
  )
}
