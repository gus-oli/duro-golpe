import Link from 'next/link'
import { StatusPill } from '@/components/ui/Primitives'

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

function getStatus(match: Pick<MatchCardProps, 'status'>) {
  if (match.status === 'LIVE') return { tone: 'live' as const, label: 'Ao vivo' }
  if (match.status === 'FINISHED') return { tone: 'resolved' as const, label: 'Final' }
  if (match.status === 'LOCKED') return { tone: 'locked' as const, label: 'Fechado' }
  return { tone: 'open' as const, label: 'Aberto' }
}

function TeamBlock({ team, align = 'left' }: { team: TeamInfo; align?: 'left' | 'right' }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center gap-3 ${align === 'right' ? 'justify-end' : ''}`}>
        {align === 'left' && team.flagUrl && (
          <img src={team.flagUrl} alt={team.name} className="h-8 w-11 rounded-sm object-cover shadow-sm" />
        )}
        <div className="min-w-0">
          <p className="font-[var(--font-display)] text-xl font-black leading-none text-[var(--ink)]">{team.fifaCode}</p>
          <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{team.name}</p>
        </div>
        {align === 'right' && team.flagUrl && (
          <img src={team.flagUrl} alt={team.name} className="h-8 w-11 rounded-sm object-cover shadow-sm" />
        )}
      </div>
    </div>
  )
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
  const isFinished = status === 'FINISHED'
  const statusMeta = getStatus({ status })

  return (
    <Link href={`/matches/${id}`} className="dg-card-interactive block overflow-hidden p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--pitch-dark)]">{stage}</p>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {kickoff.toLocaleString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <StatusPill tone={statusMeta.tone}>{statusMeta.label}</StatusPill>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <TeamBlock team={homeTeam} align="right" />

        <div className="dg-score-tile min-w-[86px] text-2xl">
          {isFinished ? `${homeScore ?? 0} - ${awayScore ?? 0}` : kickoff.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <TeamBlock team={awayTeam} />
      </div>

      {userPrediction && (
        <div className="mt-4 rounded-md bg-[rgba(12,143,79,0.09)] px-3 py-2 text-center text-sm font-bold text-[var(--pitch-dark)]">
          Seu palpite: {userPrediction.predictedHome} - {userPrediction.predictedAway}
        </div>
      )}
    </Link>
  )
}
