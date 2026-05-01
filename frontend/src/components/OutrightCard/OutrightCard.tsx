'use client'

import { useState, useTransition } from 'react'

interface OutrightOption {
  id: string
  label: string
}

interface OutrightCardProps {
  id: string
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

export function OutrightCard({
  id,
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
    <article className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">{name}</h2>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-1">
            {optionType === 'TEAM' ? 'Selecao' : 'Jogador'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-green-700">{pointValue} pts</span>
          {status === 'LOCKED' && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Encerrado</span>
          )}
          {status === 'RESOLVED' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Resolvido</span>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 text-xs text-gray-500">
        {selectionMax === 1
          ? 'Selecione 1 opcao.'
          : `Selecione exatamente ${selectionMax} opcoes.`}
      </div>

      <ul className="p-2 flex flex-col gap-1" role="listbox" aria-label={`Opcoes para ${name}`}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id)
          const selectionLimitReached = !isSelected && selected.length >= selectionMax

          return (
            <li key={option.id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                onClick={() => toggleOption(option.id)}
                disabled={isLocked || isPending || selectionLimitReached}
                className={`w-full min-h-[48px] px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-green-600 text-white'
                    : isLocked || selectionLimitReached
                      ? 'bg-gray-50 text-gray-400 cursor-default'
                      : 'bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-800'
                }`}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm text-green-600">
            Aposta especial salva com sucesso.
          </p>
        )}

        {!isLocked && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-h-[48px] w-full bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Salvando...' : hasPersistedSelection ? 'Atualizar Aposta' : 'Salvar Aposta'}
          </button>
        )}
      </div>
    </article>
  )
}
