'use client'

import { useState } from 'react'
import { EmptyState, StatusPill } from '@/components/ui/Primitives'
import { formatAppDateTime } from '@/lib/date-time'

interface LeagueUser {
  userId: string
  displayName: string
  avatarUrl: string | null
}

interface MatchPredictionItem {
  matchId: string
  kickoffTime: string
  stage: string
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED'
  homeTeam: { fifaCode: string; flagUrl: string | null; name: string }
  awayTeam: { fifaCode: string; flagUrl: string | null; name: string }
  prediction: { predictedHome: number; predictedAway: number } | null
}

interface OutrightSelectionItem {
  marketId: string
  marketName: string
  optionType: 'TEAM' | 'PLAYER'
  selections: Array<{
    optionId: string
    label: string
    teamFlagUrl: string | null
    playerPhotoUrl: string | null
  }>
}

interface FriendPicksPayload {
  matchPredictions: MatchPredictionItem[]
  outrightSelections: OutrightSelectionItem[]
}

function Avatar({ user }: { user: LeagueUser }) {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.displayName} className="h-11 w-11 rounded-2xl object-cover" />
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(12,143,79,0.12)] font-black text-[var(--pitch-dark)]">
      {user.displayName[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export function FriendPicksModal({ leagueId, user }: { leagueId: string; user: LeagueUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<FriendPicksPayload | null>(null)

  async function openModal() {
    setIsOpen(true)
    if (payload || isLoading) return

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leagues/${leagueId}/users/${user.userId}/picks`, { cache: 'no-store' })
      const data = (await res.json()) as FriendPicksPayload | { message?: string }
      if (!res.ok) {
        throw new Error((data as { message?: string }).message ?? 'Nao foi possivel carregar os palpites.')
      }
      setPayload(data as FriendPicksPayload)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar os palpites.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button type="button" className="dg-button-secondary px-4 py-2 text-xs" onClick={openModal}>
        Ver picks
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(19,32,51,0.48)] p-3 sm:items-center sm:p-6">
          <div className="w-full max-w-4xl rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_30px_80px_rgba(19,32,51,0.25)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar user={user} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Palpites do amigo</p>
                  <h3 className="text-xl font-black text-[var(--ink)]">{user.displayName}</h3>
                </div>
              </div>
              <button type="button" className="dg-button-secondary px-4 py-2 text-xs" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="max-h-[80vh] space-y-6 overflow-y-auto px-5 py-5">
              {isLoading && <p className="text-sm font-bold text-[var(--muted)]">Carregando picks...</p>}
              {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

              {!isLoading && !error && payload && (
                <>
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Partidas</p>
                        <h4 className="text-lg font-black text-[var(--ink)]">Placar por jogo</h4>
                      </div>
                      <StatusPill tone="neutral">{payload.matchPredictions.length} picks</StatusPill>
                    </div>

                    {payload.matchPredictions.length === 0 ? (
                      <EmptyState title="Sem palpites em partidas" description="Quando esse membro palpitar, os jogos aparecem aqui." />
                    ) : (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {payload.matchPredictions.map((item) => (
                          <article key={item.matchId} className="dg-surface p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">{item.stage}</p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-black text-[var(--ink)]">
                                  {item.homeTeam.fifaCode} x {item.awayTeam.fifaCode}
                                </p>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                  {formatAppDateTime(item.kickoffTime, {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-[var(--surface)] px-3 py-2 text-lg font-black text-[var(--ink)]">
                                {item.prediction ? `${item.prediction.predictedHome} - ${item.prediction.predictedAway}` : 'Sem palpite'}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">Especiais</p>
                      <h4 className="text-lg font-black text-[var(--ink)]">Outrights enviados</h4>
                    </div>

                    {payload.outrightSelections.length === 0 ? (
                      <EmptyState title="Sem outrights enviados" description="As escolhas especiais aparecem aqui quando existirem." />
                    ) : (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {payload.outrightSelections.map((item) => (
                          <article key={item.marketId} className="dg-surface p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                              {item.optionType === 'TEAM' ? 'Selecao' : 'Jogador'}
                            </p>
                            <h5 className="mt-1 text-base font-black text-[var(--ink)]">{item.marketName}</h5>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.selections.length === 0 ? (
                                <span className="text-sm text-[var(--muted)]">Sem palpite</span>
                              ) : (
                                item.selections.map((selection) => (
                                  <span
                                    key={selection.optionId}
                                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--ink)]"
                                  >
                                    {selection.playerPhotoUrl ? (
                                      <img src={selection.playerPhotoUrl} alt={selection.label} className="h-7 w-7 rounded-full object-cover" />
                                    ) : selection.teamFlagUrl ? (
                                      <img src={selection.teamFlagUrl} alt={selection.label} className="h-5 w-7 rounded-sm object-cover" />
                                    ) : null}
                                    {selection.label}
                                  </span>
                                ))
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
