'use client'

import { useState, useTransition } from 'react'
import { StatusPill } from '@/components/ui/Primitives'

interface OutrightOption {
  id: string
  label: string
}

interface OutrightCardProps {
  id: string
  code: string
  name: string
  description?: string | null
  pointValue: number
  status: 'OPEN' | 'LOCKED' | 'RESOLVED'
  selectionMin: number
  selectionMax: number
  optionType: 'TEAM' | 'PLAYER'
  options: OutrightOption[]
  userPrediction: { optionId: string } | null
  userSelections: string[]
}

function statusTone(status: OutrightCardProps['status']) {
  if (status === 'OPEN') return { tone: 'open' as const, label: 'Aberto' }
  if (status === 'RESOLVED') return { tone: 'resolved' as const, label: 'Resolvido' }
  return { tone: 'locked' as const, label: 'Encerrado' }
}

export function OutrightCard({
  id,
  code,
  name,
  description,
  pointValue,
  status,
  selectionMin,
  selectionMax,
  optionType,
  options,
  userSelections,
}: OutrightCardProps) {
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>(userSelections)
  const [hasPersistedSelection, setHasPersistedSelection] = useState(userSelections.length > 0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isLocked = status !== 'OPEN'
  const canSubmit = !isLocked && selected.length >= selectionMin && selected.length <= selectionMax && !isPending
  const meta = statusTone(status)

  function toggleOption(optionId: string) {
    if (isLocked || isPending) return

    setError(null)
    setSuccess(false)
    setSelected((current) => {
      if (selectionMax === 1) {
        return current[0] === optionId ? [] : [optionId]
      }

      if (current.includes(optionId)) {
        return current.filter((selectedOptionId) => selectedOptionId !== optionId)
      }

      if (current.length >= selectionMax) {
        return current
      }

      return [...current, optionId]
    })
  }

  function handleSubmit() {
    if (!canSubmit) return

    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/outrights/${id}/predictions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionIds: selected }),
        })

        const body = (await res.json()) as { message?: string }
        if (!res.ok) {
          setError(body.message ?? 'Erro ao registrar aposta especial.')
          return
        }

        setSuccess(true)
        setHasPersistedSelection(true)
      } catch {
        setError('Nao foi possivel conectar ao servidor.')
      }
    })
  }

  return (
    <article
      className="dg-card overflow-hidden"
      data-smoke="outright-card"
      data-market-id={id}
      data-market-code={code}
      data-market-name={name}
      data-market-status={status}
    >
      <div className="border-b border-[var(--line)] bg-[rgba(255,253,244,0.78)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
              <span className="dg-chip bg-[rgba(246,196,69,0.18)] text-[#7c4a00]">{pointValue} pts</span>
            </div>
            <h2 className="mt-3 text-xl font-black text-[var(--ink)]">{name}</h2>
            {description && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>}
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {optionType === 'TEAM' ? 'Selecao' : 'Jogador'}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 text-sm font-bold text-[var(--muted)] sm:px-5">
        {selectionMax === 1 ? 'Selecione 1 opcao.' : `Selecione exatamente ${selectionMax} opcoes.`}
      </div>

      <ul className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5" role="listbox" aria-label={`Opcoes para ${name}`}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id)
          const selectionLimitReached = !isSelected && selected.length >= selectionMax

          return (
            <li key={option.id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                onClick={() => toggleOption(option.id)}
                disabled={isLocked || isPending || selectionLimitReached}
                data-option-id={option.id}
                aria-pressed={isSelected}
                className={`min-h-touch w-full rounded-md border px-4 py-3 text-left text-sm font-bold transition ${
                  isSelected
                    ? 'border-[var(--pitch-dark)] bg-green-600 bg-[var(--pitch-dark)] text-white shadow-md'
                    : isLocked || selectionLimitReached
                      ? 'border-[var(--line)] bg-[rgba(18,33,58,0.04)] text-[var(--muted)]'
                      : 'border-[var(--line)] bg-white/70 text-[var(--ink)] hover:border-[var(--pitch)] hover:bg-[rgba(12,143,79,0.08)]'
                }`}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="px-4 pb-5 sm:px-5">
        {error && (
          <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="mb-3 rounded-md border border-[rgba(12,143,79,0.22)] bg-[rgba(12,143,79,0.1)] px-3 py-2 text-sm font-bold text-[var(--pitch-dark)]">
            Aposta especial salva com sucesso.
          </p>
        )}

        {!isLocked && (
          <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="dg-button-primary w-full">
            {isPending ? 'Salvando...' : hasPersistedSelection ? 'Atualizar Aposta' : 'Salvar Aposta'}
          </button>
        )}
      </div>
    </article>
  )
}
