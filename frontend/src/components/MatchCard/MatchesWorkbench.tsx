'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { EmptyState, SectionHeader, StatusPill } from '@/components/ui/Primitives'

type MatchStatus = 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'

interface Match {
  id: string
  kickoffTime: string
  stage: string
  venue?: string | null
  status: MatchStatus
  homeScore?: number | null
  awayScore?: number | null
  homeTeam: { id: string; name: string; fifaCode: string; flagUrl?: string | null }
  awayTeam: { id: string; name: string; fifaCode: string; flagUrl?: string | null }
  userPrediction?: { predictedHome: number; predictedAway: number } | null
}

type WorkbenchTab = 'agenda' | 'groups' | 'results'
type CardState = 'draft' | 'saving' | 'saved' | 'error'

interface DraftPrediction {
  predictedHome: string
  predictedAway: string
}

interface SaveFeedback {
  state: CardState
  message?: string
}

interface BatchResponse {
  saved: Array<{ matchId: string; predictedHome: number; predictedAway: number }>
  failed: Array<{ matchId: string; message: string; statusCode: number }>
}

function formatAgendaDate(kickoffTime: string) {
  return new Date(kickoffTime).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function formatKickoff(kickoffTime: string) {
  return new Date(kickoffTime).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusMeta(status: MatchStatus) {
  if (status === 'LIVE') return { tone: 'live' as const, label: 'Ao vivo' }
  if (status === 'FINISHED') return { tone: 'resolved' as const, label: 'Final' }
  if (status === 'LOCKED') return { tone: 'locked' as const, label: 'Fechado' }
  return { tone: 'open' as const, label: 'Aberto' }
}

function parseDraftValue(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return null
  return parsed
}

function getInitialDraft(match: Match): DraftPrediction {
  return {
    predictedHome: match.userPrediction?.predictedHome?.toString() ?? '',
    predictedAway: match.userPrediction?.predictedAway?.toString() ?? '',
  }
}

function TeamSummary({ team, reverse = false }: { team: Match['homeTeam']; reverse?: boolean }) {
  return (
    <div className={`min-w-0 ${reverse ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center gap-2 ${reverse ? 'justify-end' : ''}`}>
        {!reverse && team.flagUrl && (
          <img src={team.flagUrl} alt={team.name} className="h-7 w-10 rounded-sm object-cover shadow-sm" />
        )}
        <div className="min-w-0">
          <p className="font-[var(--font-display)] text-lg font-black leading-none text-[var(--ink)]">{team.fifaCode}</p>
          <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{team.name}</p>
        </div>
        {reverse && team.flagUrl && (
          <img src={team.flagUrl} alt={team.name} className="h-7 w-10 rounded-sm object-cover shadow-sm" />
        )}
      </div>
    </div>
  )
}

function groupByAgenda(matches: Match[]) {
  const groups = new Map<string, Match[]>()
  for (const match of matches) {
    const label = formatAgendaDate(match.kickoffTime)
    const group = groups.get(label) ?? []
    group.push(match)
    groups.set(label, group)
  }
  return Array.from(groups.entries())
}

function groupByStage(matches: Match[]) {
  const groups = new Map<string, Match[]>()
  for (const match of matches) {
    const stage = match.stage
    const group = groups.get(stage) ?? []
    group.push(match)
    groups.set(stage, group)
  }

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
}

export function MatchesWorkbench({
  initialMatches,
  isAuthenticated,
}: {
  initialMatches: Match[]
  isAuthenticated: boolean
}) {
  const [tab, setTab] = useState<WorkbenchTab>('agenda')
  const [matches, setMatches] = useState(initialMatches)
  const [drafts, setDrafts] = useState<Record<string, DraftPrediction>>({})
  const [feedback, setFeedback] = useState<Record<string, SaveFeedback>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null)

  const openMatches = useMemo(() => matches.filter((match) => match.status === 'SCHEDULED'), [matches])
  const liveCount = useMemo(() => matches.filter((match) => match.status === 'LIVE').length, [matches])
  const resultsMatches = useMemo(
    () => matches.filter((match) => match.status === 'LOCKED' || match.status === 'LIVE' || match.status === 'FINISHED'),
    [matches],
  )
  const groupStageMatches = useMemo(() => matches.filter((match) => match.stage.toLowerCase().startsWith('grupo')), [matches])

  const pendingEntries = useMemo(() => {
    return Object.entries(drafts).filter(([matchId, draft]) => {
      const match = matches.find((item) => item.id === matchId)
      if (!match) return false
      return (
        draft.predictedHome !== (match.userPrediction?.predictedHome?.toString() ?? '') ||
        draft.predictedAway !== (match.userPrediction?.predictedAway?.toString() ?? '')
      )
    })
  }, [drafts, matches])

  const pendingCount = pendingEntries.length

  function updateDraft(match: Match, field: 'predictedHome' | 'predictedAway', value: string) {
    setSummaryMessage(null)
    setFeedback((current) => {
      const next = { ...current }
      delete next[match.id]
      return next
    })

    setDrafts((current) => {
      const base = current[match.id] ?? getInitialDraft(match)
      const nextDraft = { ...base, [field]: value }
      const unchanged =
        nextDraft.predictedHome === (match.userPrediction?.predictedHome?.toString() ?? '') &&
        nextDraft.predictedAway === (match.userPrediction?.predictedAway?.toString() ?? '')

      if (unchanged) {
        const next = { ...current }
        delete next[match.id]
        return next
      }

      return {
        ...current,
        [match.id]: nextDraft,
      }
    })
  }

  function discardDrafts() {
    setDrafts({})
    setFeedback({})
    setSummaryMessage(null)
  }

  async function savePendingPredictions() {
    const payload = pendingEntries
      .map(([matchId, draft]) => {
        const predictedHome = parseDraftValue(draft.predictedHome)
        const predictedAway = parseDraftValue(draft.predictedAway)
        if (predictedHome == null || predictedAway == null) {
          setFeedback((current) => ({
            ...current,
            [matchId]: { state: 'error', message: 'Preencha os dois placares com numeros validos.' },
          }))
          return null
        }

        return { matchId, predictedHome, predictedAway }
      })
      .filter((item): item is { matchId: string; predictedHome: number; predictedAway: number } => item != null)

    if (payload.length === 0) {
      setSummaryMessage('Nenhum palpite valido pronto para salvar.')
      return
    }

    setIsSaving(true)
    setSummaryMessage(null)
    setFeedback((current) => {
      const next = { ...current }
      for (const item of payload) {
        next[item.matchId] = { state: 'saving' }
      }
      return next
    })

    try {
      const res = await fetch('/api/predictions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: payload }),
      })

      const data = (await res.json()) as BatchResponse | { message?: string }
      if (!res.ok) {
        throw new Error((data as { message?: string }).message ?? 'Não foi possível salvar os palpites.')
      }

      const result = data as BatchResponse
      const savedIds = new Set(result.saved.map((item) => item.matchId))

      if (result.saved.length > 0) {
        setMatches((current) =>
          current.map((match) => {
            const saved = result.saved.find((item) => item.matchId === match.id)
            if (!saved) return match
            return {
              ...match,
              userPrediction: {
                predictedHome: saved.predictedHome,
                predictedAway: saved.predictedAway,
              },
            }
          }),
        )
      }

      setDrafts((current) => {
        const next = { ...current }
        for (const matchId of savedIds) {
          delete next[matchId]
        }
        return next
      })

      setFeedback((current) => {
        const next = { ...current }
        for (const item of result.saved) {
          next[item.matchId] = { state: 'saved', message: 'Palpite salvo.' }
        }
        for (const item of result.failed) {
          next[item.matchId] = { state: 'error', message: item.message }
        }
        return next
      })

      setSummaryMessage(
        result.failed.length > 0
          ? `${result.saved.length} palpites salvos. ${result.failed.length} precisaram de revisao.`
          : `${result.saved.length} palpites salvos com sucesso.`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar os palpites.'
      setSummaryMessage(message)
      setFeedback((current) => {
        const next = { ...current }
        for (const item of payload) {
          next[item.matchId] = { state: 'error', message }
        }
        return next
      })
    } finally {
      setIsSaving(false)
    }
  }

  function renderInlineEditor(match: Match) {
    if (!isAuthenticated || match.status !== 'SCHEDULED') {
      return null
    }

    const draft = drafts[match.id] ?? getInitialDraft(match)
    const cardState = feedback[match.id]

    return (
      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[color:var(--surface-strong)] px-3 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <label htmlFor={`${match.id}-home`} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {match.homeTeam.fifaCode}
            </label>
            <input
              id={`${match.id}-home`}
              type="number"
              min={0}
              max={99}
              aria-label={`Palpite ${match.homeTeam.name}`}
              value={draft.predictedHome}
              onChange={(event) => updateDraft(match, 'predictedHome', event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-[var(--line)] bg-white text-center text-lg font-black text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              inputMode="numeric"
            />
          </div>
          <span className="pt-6 text-sm font-black text-[var(--muted)]">x</span>
          <div className="text-center">
            <label htmlFor={`${match.id}-away`} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {match.awayTeam.fifaCode}
            </label>
            <input
              id={`${match.id}-away`}
              type="number"
              min={0}
              max={99}
              aria-label={`Palpite ${match.awayTeam.name}`}
              value={draft.predictedAway}
              onChange={(event) => updateDraft(match, 'predictedAway', event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-[var(--line)] bg-white text-center text-lg font-black text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span className="text-[var(--muted)]">
            {cardState?.state === 'saving'
              ? 'Salvando...'
              : cardState?.state === 'saved'
                ? 'Salvo'
                : cardState?.state === 'error'
                  ? cardState.message
                  : drafts[match.id]
                    ? 'Alteracao pendente'
                    : match.userPrediction
                      ? 'Palpite salvo'
                      : 'Sem palpite'}
          </span>
          {match.userPrediction && !drafts[match.id] && (
            <span className="text-[var(--accent-strong)]">
              Atual: {match.userPrediction.predictedHome} - {match.userPrediction.predictedAway}
            </span>
          )}
        </div>
      </div>
    )
  }

  function renderMatchCard(match: Match, mode: 'editable' | 'results') {
    const kickoff = formatKickoff(match.kickoffTime)
    const statusMeta = getStatusMeta(match.status)
    const isResultsMode = mode === 'results'
    const scoreLabel =
      match.status === 'LIVE' || match.status === 'FINISHED'
        ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
        : new Date(match.kickoffTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    return (
      <article key={match.id} className="dg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">{match.stage}</p>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">{kickoff}</p>
            {match.venue && <p className="mt-1 text-xs font-medium text-[var(--muted)]">{match.venue}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={statusMeta.tone}>{statusMeta.label}</StatusPill>
            <Link href={`/matches/${match.id}`} className="dg-chip">
              Detalhes
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <TeamSummary team={match.homeTeam} reverse />
          <div className="dg-score-tile min-w-[78px] text-xl sm:min-w-[86px] sm:text-2xl">{scoreLabel}</div>
          <TeamSummary team={match.awayTeam} />
        </div>

        {isResultsMode ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[rgba(12,34,58,0.04)] px-3 py-2 text-sm font-bold">
            <span className="text-[var(--muted)]">
              {match.status === 'FINISHED' ? 'Resultado oficial' : match.status === 'LIVE' ? 'Placar em andamento' : 'Janela encerrada'}
            </span>
            {match.userPrediction && (
              <span className="text-[var(--accent-strong)]">
                Seu palpite: {match.userPrediction.predictedHome} - {match.userPrediction.predictedAway}
              </span>
            )}
          </div>
        ) : (
          renderInlineEditor(match)
        )}
      </article>
    )
  }

  const agendaSections = groupByAgenda(matches)
  const groupSections = groupByStage(groupStageMatches)
  const resultSections = groupByAgenda(resultsMatches)

  return (
    <div className="space-y-6">
      <section className="dg-panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="dg-eyebrow">Mesa de trabalho da Copa</p>
            <h1 className="mt-2 text-4xl font-black text-[var(--ink)] sm:text-5xl">Partidas</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Feche a rodada sem sair da agenda, troque para grupos quando quiser revisar a fase inicial e use resultados para acompanhar o que ja pesou na tabela.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
            <div className="dg-subtle-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Abertas</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{openMatches.length}</p>
            </div>
            <div className="dg-subtle-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Ao vivo</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{liveCount}</p>
            </div>
            <div className="dg-subtle-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Pendentes</p>
              <p className="mt-1 font-[var(--font-display)] text-3xl font-black text-[var(--ink)]">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {([
          { key: 'agenda', title: 'Agenda', description: 'Preencha a rodada por data e feche varios palpites de uma vez.' },
          { key: 'groups', title: 'Grupos', description: 'Revise a fase de grupos no formato mais natural para a Copa.' },
          { key: 'results', title: 'Resultados', description: 'Veja placares e compare o que ja aconteceu com seu palpite.' },
        ] as Array<{ key: WorkbenchTab; title: string; description: string }>).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-[28px] border p-4 text-left transition ${tab === item.key ? 'border-[var(--accent)] bg-[rgba(22,129,255,0.08)] shadow-sm' : 'border-[var(--line)] bg-[color:var(--surface)] hover:border-[rgba(22,129,255,0.3)]'}`}
          >
            <p className="dg-eyebrow">{item.title}</p>
            <h2 className="mt-2 text-lg font-black text-[var(--ink)]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
          </button>
        ))}
      </section>

      {tab === 'agenda' && (
        agendaSections.length === 0 ? (
          <EmptyState title="Nenhuma partida disponível" description="Quando o calendário estiver carregado, os jogos aparecem aqui." />
        ) : (
          <div className="space-y-7">
            {agendaSections.map(([date, dayMatches]) => (
              <section key={date} className="space-y-4">
                <SectionHeader
                  eyebrow="Agenda"
                  title={date}
                  actions={<StatusPill tone="neutral">{dayMatches.length} jogos</StatusPill>}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  {dayMatches.map((match) => renderMatchCard(match, 'editable'))}
                </div>
              </section>
            ))}
          </div>
        )
      )}

      {tab === 'groups' && (
        groupSections.length === 0 ? (
          <EmptyState title="Fase de grupos indisponível" description="Os jogos de grupo aparecem aqui quando o calendário tiver fixtures de grupos." />
        ) : (
          <div className="space-y-7">
            {groupSections.map(([stage, stageMatches]) => (
              <section key={stage} className="space-y-4">
                <SectionHeader
                  eyebrow="Grupos"
                  title={stage}
                  actions={<StatusPill tone="neutral">{stageMatches.length} jogos</StatusPill>}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  {stageMatches.map((match) => renderMatchCard(match, 'editable'))}
                </div>
              </section>
            ))}
          </div>
        )
      )}

      {tab === 'results' && (
        resultSections.length === 0 ? (
          <EmptyState title="Nenhum resultado ainda" description="Assim que os jogos travarem, entrarem ao vivo ou terminarem, eles aparecem aqui por agenda." />
        ) : (
          <div className="space-y-7">
            {resultSections.map(([date, dayMatches]) => (
              <section key={date} className="space-y-4">
                <SectionHeader
                  eyebrow="Resultados"
                  title={date}
                  actions={<StatusPill tone="neutral">{dayMatches.length} jogos</StatusPill>}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  {dayMatches.map((match) => renderMatchCard(match, 'results'))}
                </div>
              </section>
            ))}
          </div>
        )
      )}

      {isAuthenticated && pendingCount > 0 && (
        <div className="sticky bottom-4 z-30">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-[28px] border border-[var(--line)] bg-[color:var(--surface-strong)] p-4 shadow-[0_18px_42px_rgba(10,19,36,0.18)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-[var(--ink)]">{pendingCount} palpites pendentes</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {summaryMessage ?? 'Edite varios jogos e salve tudo em uma unica passada.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="dg-button-secondary" onClick={discardDrafts} disabled={isSaving}>
                Descartar
              </button>
              <button type="button" className="dg-button-primary" onClick={savePendingPredictions} disabled={isSaving}>
                {isSaving ? 'Salvando...' : `Salvar ${pendingCount} palpites`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
