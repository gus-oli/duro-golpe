'use client'

import { useEffect, useMemo, useState } from 'react'
import { EmptyState, SectionHeader, StatusPill } from '@/components/ui/Primitives'
import {
  GROUP_LETTERS,
  ROUND_LABELS,
  buildResolvedBracket,
  canGenerateBracket,
  createDefaultRankings,
  createInitialSimulatorState,
  deriveSelectedThirdGroups,
  getChampion,
  getRoundMatches,
  getTeamFallback,
  groupTeamsByLetter,
  hasCompleteGroups,
  isCompleteGroupRanking,
  sanitizeWinners,
  setMatchWinner,
  type GroupLetter,
  type ResolvedKnockoutMatch,
  type RoundName,
  type SimulatorTeam,
} from '@/lib/world-cup-simulator'
import {
  SIMULATOR_STORAGE_KEY,
  createResetSimulatorState,
  parseStoredSimulatorState,
} from '@/lib/world-cup-simulator-storage'
import type { SimulatorState } from '@/lib/world-cup-simulator-types'

const BRACKET_ROUNDS: RoundName[] = ['round32', 'round16', 'quarterfinal', 'semifinal', 'thirdPlace', 'final']
const LEFT_SIDE = {
  round32: [74, 77, 73, 75, 83, 84, 81, 82],
  round16: [89, 90, 93, 94],
  quarterfinal: [97, 98],
  semifinal: [101],
}
const RIGHT_SIDE = {
  round32: [76, 78, 79, 80, 86, 88, 85, 87],
  round16: [91, 92, 95, 96],
  quarterfinal: [99, 100],
  semifinal: [102],
}
const EXPORT_CANVAS_WIDTH = 2600
const EXPORT_CANVAS_HEIGHT = 1500
const EXPORT_NODE_WIDTH = 250
const EXPORT_NODE_HEIGHT = 96
const EXPORT_LEFT_X = [80, 430, 710, 960]
const EXPORT_RIGHT_X = EXPORT_LEFT_X.map((x) => EXPORT_CANVAS_WIDTH - x - EXPORT_NODE_WIDTH)
const EXPORT_Y = {
  round32: [70, 220, 370, 520, 830, 980, 1130, 1280],
  round16: [145, 445, 905, 1205],
  quarterfinal: [295, 1055],
  semifinal: [675],
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function TeamBadge({
  team,
  selected = false,
  faded = false,
}: {
  team: SimulatorTeam | null
  selected?: boolean
  faded?: boolean
}) {
  return (
    <span
      className={cx(
        'inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white text-xs font-black text-[var(--ink)] shadow-sm',
        selected ? 'border-[var(--accent)] ring-4 ring-[rgba(22,129,255,0.12)]' : 'border-[var(--line-strong)]',
        faded && 'opacity-40',
      )}
    >
      {team?.flagUrl ? <img src={team.flagUrl} alt={team.name} className="h-full w-full object-cover" /> : team ? getTeamFallback(team) : '?'}
    </span>
  )
}

function MatchNode({
  match,
  onPick,
}: {
  match: ResolvedKnockoutMatch
  onPick: (matchNumber: number, teamId: string) => void
}) {
  const teams = [match.home, match.away]

  return (
    <article className="min-w-[128px] rounded-md border border-dashed border-[var(--line-strong)] bg-white/80 px-2 py-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">M{match.matchNumber}</span>
        <span className="text-[10px] font-bold text-[var(--accent-strong)]">{ROUND_LABELS[match.round]}</span>
      </div>
      <div className="space-y-2">
        {teams.map((slot) => {
          const isWinner = Boolean(slot.team && match.winner?.id === slot.team.id)
          const isEliminated = Boolean(match.winner && slot.team && match.winner.id !== slot.team.id)
          return (
            <button
              key={`${match.matchNumber}-${slot.label}`}
              type="button"
              disabled={!slot.team}
              onClick={() => slot.team && onPick(match.matchNumber, slot.team.id)}
              className={cx(
                'flex min-h-[48px] w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-left transition',
                isWinner
                  ? 'border-[var(--accent)] bg-[rgba(22,129,255,0.10)]'
                  : 'border-[var(--line)] bg-[var(--surface)] hover:border-[rgba(22,129,255,0.24)]',
                !slot.team && 'cursor-not-allowed opacity-60',
              )}
            >
              <TeamBadge team={slot.team} selected={isWinner} faded={isEliminated} />
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{slot.label}</span>
                <span className={cx('block truncate text-xs font-black text-[var(--ink)]', isEliminated && 'opacity-45')}>
                  {slot.team?.fifaCode ?? 'A definir'}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

function pickMatches(bracket: ResolvedKnockoutMatch[], matchNumbers: number[]) {
  return matchNumbers.map((matchNumber) => bracket.find((match) => match.matchNumber === matchNumber)).filter(Boolean) as ResolvedKnockoutMatch[]
}

function getDownloadName(champion: SimulatorTeam | null) {
  const suffix = champion?.fifaCode ? `-${champion.fifaCode.toLowerCase()}` : ''
  return `duro-golpe-simulador-copa-2026${suffix}.png`
}

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function drawExportText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
) {
  context.save()
  context.font = font
  context.fillStyle = color
  context.textAlign = align
  context.textBaseline = 'middle'
  let next = text
  while (context.measureText(next).width > maxWidth && next.length > 4) {
    next = `${next.slice(0, -4)}...`
  }
  context.fillText(next, x, y)
  context.restore()
}

function drawExportTeamBadge(context: CanvasRenderingContext2D, team: SimulatorTeam | null, x: number, y: number, selected: boolean, faded = false) {
  const radius = 28
  context.save()
  context.globalAlpha = faded ? 0.42 : 1
  context.beginPath()
  context.arc(x + radius, y + radius, radius, 0, Math.PI * 2)
  context.fillStyle = selected ? '#dbeafe' : '#ffffff'
  context.fill()
  context.lineWidth = selected ? 5 : 3
  context.strokeStyle = selected ? '#1681ff' : '#d7dde4'
  context.stroke()
  drawExportText(context, team ? getTeamFallback(team) : '?', x + radius, y + radius + 1, 44, '900 18px Arial', '#102036', 'center')
  context.restore()
}

function drawExportMatch(
  context: CanvasRenderingContext2D,
  match: ResolvedKnockoutMatch,
  x: number,
  y: number,
  align: 'left' | 'right' | 'center' = 'left',
) {
  const teams = [match.home, match.away]
  const width = EXPORT_NODE_WIDTH
  const height = EXPORT_NODE_HEIGHT

  context.save()
  drawRoundedRect(context, x, y, width, height, 12)
  context.fillStyle = 'rgba(255,255,255,0.92)'
  context.fill()
  context.setLineDash([7, 5])
  context.lineWidth = 2
  context.strokeStyle = '#d7dde4'
  context.stroke()
  context.setLineDash([])
  drawExportText(context, `M${match.matchNumber}`, x + 18, y + 18, 70, '900 16px Arial', '#718096')
  drawExportText(context, ROUND_LABELS[match.round], x + width - 18, y + 18, 130, '900 14px Arial', '#005ecb', 'right')

  for (let index = 0; index < teams.length; index += 1) {
    const slot = teams[index]
    const rowY = y + 30 + index * 32
    const isWinner = Boolean(slot.team && match.winner?.id === slot.team.id)
    const isEliminated = Boolean(match.winner && slot.team && match.winner.id !== slot.team.id)

    drawRoundedRect(context, x + 12, rowY, width - 24, 28, 8)
    context.fillStyle = isWinner ? 'rgba(22,129,255,0.14)' : '#f5f1e9'
    context.fill()
    context.lineWidth = 2
    context.strokeStyle = isWinner ? '#1681ff' : '#e1dbd0'
    context.stroke()
    context.globalAlpha = isEliminated ? 0.46 : 1

    const badgeX = align === 'right' ? x + width - 54 : x + 18
    const textX = align === 'right' ? x + width - 66 : x + 66
    drawExportTeamBadge(context, slot.team, badgeX, rowY - 14, isWinner, isEliminated)
    drawExportText(context, slot.label, textX, rowY + 8, 62, '900 12px Arial', '#718096', align === 'right' ? 'right' : 'left')
    drawExportText(context, slot.team?.fifaCode ?? '---', textX, rowY + 23, 115, '900 18px Arial', '#102036', align === 'right' ? 'right' : 'left')
    context.globalAlpha = 1
  }
  context.restore()
}

function drawExportConnector(context: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, side: 'left' | 'right') {
  const midX = side === 'left' ? fromX + 54 : fromX - 54
  context.save()
  context.strokeStyle = '#ccd3dc'
  context.lineWidth = 2
  context.setLineDash([5, 5])
  context.beginPath()
  context.moveTo(fromX, fromY)
  context.lineTo(midX, fromY)
  context.lineTo(midX, toY)
  context.lineTo(toX, toY)
  context.stroke()
  context.restore()
}

function drawExportSide(
  context: CanvasRenderingContext2D,
  bracket: ResolvedKnockoutMatch[],
  side: typeof LEFT_SIDE,
  xValues: number[],
  align: 'left' | 'right',
) {
  const sideName = align === 'left' ? 'left' : 'right'
  const rounds = [side.round32, side.round16, side.quarterfinal, side.semifinal]
  const yValues = [EXPORT_Y.round32, EXPORT_Y.round16, EXPORT_Y.quarterfinal, EXPORT_Y.semifinal]

  for (let column = 0; column < rounds.length; column += 1) {
    for (let index = 0; index < rounds[column].length; index += 1) {
      const match = bracket.find((candidate) => candidate.matchNumber === rounds[column][index])
      if (match) {
        drawExportMatch(context, match, xValues[column], yValues[column][index], align)
      }
    }
  }

  for (let column = 0; column < rounds.length - 1; column += 1) {
    for (let index = 0; index < rounds[column + 1].length; index += 1) {
      const childY = yValues[column + 1][index] + EXPORT_NODE_HEIGHT / 2
      const firstParentY = yValues[column][index * 2] + EXPORT_NODE_HEIGHT / 2
      const secondParentY = yValues[column][index * 2 + 1] + EXPORT_NODE_HEIGHT / 2
      const fromX = align === 'left' ? xValues[column] + EXPORT_NODE_WIDTH : xValues[column]
      const toX = align === 'left' ? xValues[column + 1] : xValues[column + 1] + EXPORT_NODE_WIDTH

      drawExportConnector(context, fromX, firstParentY, toX, childY, sideName)
      drawExportConnector(context, fromX, secondParentY, toX, childY, sideName)
    }
  }
}

function downloadBracketPng(bracket: ResolvedKnockoutMatch[], champion: SimulatorTeam | null) {
  const canvas = document.createElement('canvas')
  canvas.width = EXPORT_CANVAS_WIDTH
  canvas.height = EXPORT_CANVAS_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) return

  const gradient = context.createLinearGradient(0, 0, 0, EXPORT_CANVAS_HEIGHT)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(1, '#f7faf8')
  context.fillStyle = gradient
  context.fillRect(0, 0, EXPORT_CANVAS_WIDTH, EXPORT_CANVAS_HEIGHT)

  drawExportText(context, 'Duro Golpe - Simulador da Copa 2026', EXPORT_CANVAS_WIDTH / 2, 42, 720, '900 30px Arial', '#102036', 'center')
  drawExportSide(context, bracket, LEFT_SIDE, EXPORT_LEFT_X, 'left')
  drawExportSide(context, bracket, RIGHT_SIDE, EXPORT_RIGHT_X, 'right')

  const finalMatch = bracket.find((match) => match.matchNumber === 104)
  const thirdPlaceMatch = bracket.find((match) => match.matchNumber === 103)
  if (finalMatch) drawExportMatch(context, finalMatch, 1175, 610, 'center')
  if (thirdPlaceMatch) drawExportMatch(context, thirdPlaceMatch, 1175, 835, 'center')

  context.save()
  context.beginPath()
  context.arc(EXPORT_CANVAS_WIDTH / 2, 380, 72, 0, Math.PI * 2)
  context.fillStyle = '#ffffff'
  context.fill()
  context.lineWidth = 4
  context.strokeStyle = '#d7dde4'
  context.stroke()
  drawExportTeamBadge(context, champion, EXPORT_CANVAS_WIDTH / 2 - 28, 352, Boolean(champion))
  drawExportText(context, 'CAMPEAO', EXPORT_CANVAS_WIDTH / 2, 495, 180, '900 18px Arial', '#005ecb', 'center')
  drawExportText(context, champion?.fifaCode ?? '---', EXPORT_CANVAS_WIDTH / 2, 540, 220, '900 54px Arial', '#102036', 'center')
  context.restore()

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = getDownloadName(champion)
  link.click()
}

function WallchartBracket({
  bracket,
  champion,
  onPick,
}: {
  bracket: ResolvedKnockoutMatch[]
  champion: SimulatorTeam | null
  onPick: (matchNumber: number, teamId: string) => void
}) {
  const finalMatch = bracket.find((match) => match.matchNumber === 104)
  const thirdPlaceMatch = bracket.find((match) => match.matchNumber === 103)

  return (
    <div className="relative left-1/2 hidden w-[calc(100vw-1rem)] max-w-[1280px] -translate-x-1/2 overflow-x-auto rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff,#f7faf8)] p-3 lg:block">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-[1.16fr_0.82fr_0.59fr_0.48fr_184px_0.48fr_0.59fr_0.82fr_1.16fr] items-center gap-2">
          <div className="space-y-2">
            {pickMatches(bracket, LEFT_SIDE.round32).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
          <div className="space-y-6">
            {pickMatches(bracket, LEFT_SIDE.round16).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
          <div className="space-y-16">
            {pickMatches(bracket, LEFT_SIDE.quarterfinal).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
          <div>
            {pickMatches(bracket, LEFT_SIDE.semifinal).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full border border-[var(--line-strong)] bg-white p-3 shadow-[0_18px_38px_rgba(10,19,36,0.12)]">
              <TeamBadge team={champion} selected={Boolean(champion)} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-strong)]">Campeao</p>
              <p className="mt-1 font-[var(--font-display)] text-2xl font-black text-[var(--ink)]">{champion?.fifaCode ?? '---'}</p>
            </div>
            {finalMatch && <MatchNode match={finalMatch} onPick={onPick} />}
            {thirdPlaceMatch && <MatchNode match={thirdPlaceMatch} onPick={onPick} />}
          </div>

          <div>
            {pickMatches(bracket, RIGHT_SIDE.semifinal).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
          <div className="space-y-16">
            {pickMatches(bracket, RIGHT_SIDE.quarterfinal).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
          <div className="space-y-6">
            {pickMatches(bracket, RIGHT_SIDE.round16).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
          <div className="space-y-2">
            {pickMatches(bracket, RIGHT_SIDE.round32).map((match) => <MatchNode key={match.matchNumber} match={match} onPick={onPick} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileRoundBracket({
  bracket,
  activeRound,
  setActiveRound,
  onPick,
}: {
  bracket: ResolvedKnockoutMatch[]
  activeRound: RoundName
  setActiveRound: (round: RoundName) => void
  onPick: (matchNumber: number, teamId: string) => void
}) {
  return (
    <div className="space-y-4 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {BRACKET_ROUNDS.map((round) => (
          <button
            key={round}
            type="button"
            onClick={() => setActiveRound(round)}
            className={cx(
              'shrink-0 rounded-md border px-3 py-2 text-xs font-black',
              activeRound === round
                ? 'border-[var(--accent)] bg-[rgba(22,129,255,0.10)] text-[var(--accent-strong)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]',
            )}
          >
            {ROUND_LABELS[round]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {getRoundMatches(bracket, activeRound).map((match) => (
          <MatchNode key={match.matchNumber} match={match} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}

export function WorldCupSimulator({ initialTeams }: { initialTeams: SimulatorTeam[] }) {
  const groupedTeams = useMemo(() => groupTeamsByLetter(initialTeams), [initialTeams])
  const defaultRankings = useMemo(() => createDefaultRankings(groupedTeams), [groupedTeams])
  const [state, setState] = useState<SimulatorState>(() => ({
    ...createInitialSimulatorState(),
    groupRankings: defaultRankings,
  }))
  const [hasLoadedLocalState, setHasLoadedLocalState] = useState(false)
  const [activeRound, setActiveRound] = useState<RoundName>('round32')

  useEffect(() => {
    try {
      const stored = parseStoredSimulatorState(window.localStorage.getItem(SIMULATOR_STORAGE_KEY), defaultRankings)
      if (stored) {
        setState(stored)
      }
    } finally {
      setHasLoadedLocalState(true)
    }
  }, [defaultRankings])

  useEffect(() => {
    if (!hasLoadedLocalState) return
    window.localStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(state))
  }, [hasLoadedLocalState, state])

  const rankings = state.groupRankings
  const selectedThirds = useMemo(() => deriveSelectedThirdGroups(rankings), [rankings])
  const completeRanking = isCompleteGroupRanking(rankings)
  const readyForBracket = canGenerateBracket(rankings, selectedThirds)
  const bracket = useMemo(
    () =>
      completeRanking && readyForBracket
        ? buildResolvedBracket({
            rankings,
            selectedThirds,
            teams: initialTeams,
            winners: state.winners,
          })
        : [],
    [completeRanking, initialTeams, rankings, readyForBracket, selectedThirds, state.winners],
  )
  const champion = getChampion(bracket)

  function setTeamPosition(group: GroupLetter, teamId: string, position: 1 | 2 | 3) {
    setState((current) => {
      const currentRanking = current.groupRankings[group] ?? []
      const nextGroupRanking = [...currentRanking]
      const currentIndex = nextGroupRanking.indexOf(teamId)
      const currentSelectedThirds = deriveSelectedThirdGroups(current.groupRankings)
      const groupAlreadyHasThird = Boolean(currentRanking[2])

      if (position === 3 && !groupAlreadyHasThird && currentIndex !== 2 && currentSelectedThirds.length >= 8) {
        return current
      }

      if (currentIndex >= 0) {
        nextGroupRanking[currentIndex] = ''
      }

      nextGroupRanking[position - 1] = teamId

      const groupRankings = {
        ...current.groupRankings,
        [group]: nextGroupRanking,
      }
      const nextSelectedThirds = deriveSelectedThirdGroups(groupRankings)
      const winners =
        isCompleteGroupRanking(groupRankings) && canGenerateBracket(groupRankings, nextSelectedThirds)
          ? sanitizeWinners({
              rankings: groupRankings,
              selectedThirds: nextSelectedThirds,
              teams: initialTeams,
              winners: current.winners,
            })
          : {}

      return {
        ...current,
        groupRankings,
        selectedThirds: nextSelectedThirds,
        winners,
      }
    })
  }

  function resetGroup(group: GroupLetter) {
    setState((current) => ({
      ...current,
      groupRankings: {
        ...current.groupRankings,
        [group]: [],
      },
      selectedThirds: deriveSelectedThirdGroups({
        ...current.groupRankings,
        [group]: [],
      }),
      winners: {},
    }))
  }

  function chooseWinner(matchNumber: number, teamId: string) {
    if (!completeRanking || !readyForBracket) return
    setState((current) => ({
      ...current,
      winners: setMatchWinner({
        rankings,
        selectedThirds,
        teams: initialTeams,
        winners: current.winners,
        matchNumber,
        teamId,
      }),
    }))
  }

  function resetSimulation() {
    const next = createResetSimulatorState(defaultRankings)
    window.localStorage.removeItem(SIMULATOR_STORAGE_KEY)
    setState(next)
    setActiveRound('round32')
  }

  if (!hasCompleteGroups(groupedTeams)) {
    return (
      <EmptyState
        title="Simulador indisponivel"
        description="Quando os 12 grupos da Copa 2026 estiverem carregados com quatro selecoes cada, o bracket oficial aparece aqui."
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="dg-panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="dg-eyebrow">Simulador da Copa</p>
            <h1 className="mt-2 text-4xl font-black text-[var(--ink)] sm:text-5xl">Monte sua Copa 2026</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Ordene os grupos, escolha os oito terceiros e clique nos vencedores. O caminho usa o chaveamento oficial da Copa 2026, sem ser produto oficial da FIFA.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={readyForBracket ? 'success' : 'warning'}>
              {readyForBracket ? 'Bracket pronto' : `${selectedThirds.length}/8 terceiros`}
            </StatusPill>
            <button type="button" className="dg-button-secondary" onClick={resetSimulation}>
              Resetar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['groups', 'Grupos'],
            ['bracket', 'Mata-mata'],
          ].map(([step, label]) => (
            <button
              key={step}
              type="button"
              onClick={() => setState((current) => ({ ...current, currentStep: step as SimulatorState['currentStep'] }))}
              className={cx(
                'rounded-md border px-3 py-3 text-sm font-black transition',
                state.currentStep === step
                  ? 'border-[var(--accent)] bg-[rgba(22,129,255,0.10)] text-[var(--accent-strong)]'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[rgba(22,129,255,0.24)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {state.currentStep === 'groups' && (
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Grupos"
            title="Escolha 1o, 2o e os oito 3os"
            description="Marque primeiro e segundo de cada grupo. Depois escolha apenas oito terceiros classificados; eles entram automaticamente na Annex C oficial."
            actions={
              <>
                <StatusPill tone={selectedThirds.length === 8 ? 'success' : 'warning'}>{selectedThirds.length}/8 terceiros</StatusPill>
                <button
                  type="button"
                  className="dg-button-primary"
                  onClick={() => setState((current) => ({ ...current, currentStep: 'bracket' }))}
                  disabled={!readyForBracket}
                >
                  Gerar mata-mata
                </button>
              </>
            }
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {GROUP_LETTERS.map((group) => {
              const ranking = rankings[group] ?? []
              return (
                <article key={group} className="dg-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-black text-[var(--ink)]">Grupo {group}</h2>
                    <div className="flex items-center gap-2">
                      <StatusPill tone={ranking[0] && ranking[1] ? 'success' : 'neutral'}>
                        {ranking[0] && ranking[1] ? 'Top 2 ok' : 'Top 2 pendente'}
                      </StatusPill>
                      <button type="button" className="dg-button-secondary px-3 py-2 text-xs" onClick={() => resetGroup(group)} disabled={ranking.length === 0}>
                        Limpar
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-md border border-[var(--line)]">
                    <div className="grid grid-cols-[minmax(0,1fr)_132px] bg-[var(--surface-strong)] px-3 py-2 text-xs font-bold text-[var(--muted)]">
                      <span>Selecao</span>
                      <span className="grid grid-cols-3 text-center">
                        <span>1o</span>
                        <span>2o</span>
                        <span>3o</span>
                      </span>
                    </div>
                    {groupedTeams[group].map((team) => {
                      const currentPosition = ranking.indexOf(team.id) + 1
                      const thirdDisabled =
                        currentPosition !== 3 && !ranking[2] && selectedThirds.length >= 8

                      return (
                        <div
                          key={team.id}
                          className="grid min-h-[56px] grid-cols-[minmax(0,1fr)_132px] items-center border-t border-white bg-[rgba(12,34,58,0.035)] px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <TeamBadge team={team} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[var(--ink)]">{team.name}</p>
                              <p className="text-xs font-bold text-[var(--muted)]">{team.fifaCode}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 justify-items-center gap-2">
                            {([1, 2, 3] as const).map((position) => {
                              const selected = currentPosition === position
                              const disabled = position === 3 && thirdDisabled
                              return (
                                <button
                                  key={position}
                                  type="button"
                                  aria-label={`${team.name} em ${position}o no Grupo ${group}`}
                                  disabled={disabled}
                                  onClick={() => setTeamPosition(group, team.id, position)}
                                  className={cx(
                                    'h-8 w-8 rounded-full border text-xs font-black transition',
                                    selected
                                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                                      : 'border-[var(--pitch)] bg-white text-[var(--pitch)] hover:bg-[rgba(20,148,83,0.08)]',
                                    disabled && 'cursor-not-allowed border-[var(--line-strong)] text-[var(--muted)] opacity-35',
                                  )}
                                >
                                  {selected ? position : ''}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {state.currentStep === 'bracket' && (
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Mata-mata"
            title="Clique nos vencedores"
            description="O Round of 32 foi montado com os slots oficiais da Copa 2026. Trocar um vencedor anterior limpa escolhas que nao fazem mais sentido."
            actions={
              <>
                <StatusPill tone={champion ? 'success' : 'neutral'}>{champion ? `${champion.name} campeao` : 'Em aberto'}</StatusPill>
                {readyForBracket && completeRanking && (
                  <button type="button" className="dg-button-primary" onClick={() => downloadBracketPng(bracket, champion)}>
                    Baixar PNG
                  </button>
                )}
              </>
            }
          />
          {!readyForBracket || !completeRanking ? (
            <EmptyState
              title="Bracket ainda nao pode ser gerado"
              description="Complete os grupos e selecione exatamente oito terceiros para liberar o chaveamento."
            />
          ) : (
            <>
              <WallchartBracket bracket={bracket} champion={champion} onPick={chooseWinner} />
              <MobileRoundBracket bracket={bracket} activeRound={activeRound} setActiveRound={setActiveRound} onPick={chooseWinner} />
            </>
          )}
        </section>
      )}
    </div>
  )
}
