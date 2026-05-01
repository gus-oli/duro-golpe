import Link from 'next/link'

interface TeamInfo {
  id: string
  name: string
  fifaCode: string
  flagUrl?: string | null
}

interface MatchCardProps {
  id: string
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  kickoffTime: string
  stage: string
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeScore?: number | null
  awayScore?: number | null
  userPrediction?: { predictedHome: number; predictedAway: number } | null
}

export function MatchCard({
  id,
  homeTeam,
  awayTeam,
  kickoffTime,
  stage,
  status,
  homeScore,
  awayScore,
  userPrediction,
}: MatchCardProps) {
  const kickoff = new Date(kickoffTime)
  const isLocked = status !== 'SCHEDULED'
  const isFinished = status === 'FINISHED'

  return (
    <Link
      href={`/matches/${id}`}
      className="block rounded-xl border border-gray-200 p-4 hover:border-green-400 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <span className="font-semibold text-lg">{homeTeam.fifaCode}</span>
          {homeTeam.flagUrl && (
            <img src={homeTeam.flagUrl} alt={homeTeam.name} className="inline-block w-6 h-4 ml-2 object-cover" />
          )}
        </div>

        <div className="text-center min-w-[80px]">
          {isFinished ? (
            <span className="text-xl font-bold">{homeScore} – {awayScore}</span>
          ) : (
            <span className="text-sm text-gray-500">
              {kickoff.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isLocked && !isFinished && (
            <div className="text-xs text-orange-500 font-medium mt-1">🔒 Encerrado</div>
          )}
        </div>

        <div className="flex-1 text-left">
          {awayTeam.flagUrl && (
            <img src={awayTeam.flagUrl} alt={awayTeam.name} className="inline-block w-6 h-4 mr-2 object-cover" />
          )}
          <span className="font-semibold text-lg">{awayTeam.fifaCode}</span>
        </div>
      </div>

      {userPrediction && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Seu palpite: {userPrediction.predictedHome} – {userPrediction.predictedAway}
        </div>
      )}

      <div className="mt-1 text-center text-xs text-gray-400">{stage}</div>
    </Link>
  )
}
