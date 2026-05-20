'use client'

import { useState, useTransition } from 'react'

interface PredictionInputProps {
  matchId: string
  existingPrediction?: { predictedHome: number; predictedAway: number } | null
  locked?: boolean
  onSubmit?: (home: number, away: number) => Promise<void>
}

export function PredictionInput({
  matchId: _matchId,
  existingPrediction,
  locked = false,
  onSubmit,
}: PredictionInputProps) {
  const [home, setHome] = useState(existingPrediction?.predictedHome ?? '')
  const [away, setAway] = useState(existingPrediction?.predictedAway ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isDisabled = locked || isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (locked || home === '' || away === '') return
    if (!onSubmit) {
      setError('Envio indisponível no momento')
      return
    }

    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        await onSubmit(Number(home), Number(away))
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao enviar palpite')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4" aria-disabled={locked}>
      <div className="rounded-md border border-[var(--line)] bg-white/70 p-4">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Seu palpite
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <label className="dg-label text-center" htmlFor="prediction-home">Casa</label>
            <input
              id="prediction-home"
              type="number"
              min={0}
              max={99}
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="dg-input text-center font-[var(--font-display)] text-3xl font-black"
              aria-label="Gols do time da casa"
              disabled={isDisabled}
            />
          </div>

          <span className="pb-3 text-xl font-black text-[var(--gold)]">x</span>

          <div>
            <label className="dg-label text-center" htmlFor="prediction-away">Visitante</label>
            <input
              id="prediction-away"
              type="number"
              min={0}
              max={99}
              value={away}
              onChange={(e) => setAway(e.target.value)}
              className="dg-input text-center font-[var(--font-display)] text-3xl font-black"
              aria-label="Gols do time visitante"
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-md border border-[rgba(12,143,79,0.22)] bg-[rgba(12,143,79,0.1)] px-3 py-2 text-sm font-bold text-[var(--pitch-dark)]">
          Palpite enviado!
        </p>
      )}

      <button
        type="submit"
        disabled={isDisabled || home === '' || away === ''}
        className={locked ? 'hidden' : 'dg-button-primary w-full'}
        aria-hidden={locked}
        tabIndex={locked ? -1 : undefined}
      >
        {isPending ? 'Enviando...' : existingPrediction ? 'Atualizar Palpite' : 'Enviar Palpite'}
      </button>
    </form>
  )
}
