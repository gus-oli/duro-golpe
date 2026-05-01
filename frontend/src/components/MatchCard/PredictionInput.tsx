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
      setError('Envio indisponivel no momento')
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4"
      aria-disabled={locked}
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-600 mb-1">Casa</label>
          <input
            type="number"
            min={0}
            max={99}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className={`w-16 h-12 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none transition-colors ${
              isDisabled
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 focus:border-green-500'
            }`}
            aria-label="Gols do time da casa"
            disabled={isDisabled}
          />
        </div>

        <span className="text-2xl font-bold text-gray-400">-</span>

        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-600 mb-1">Visitante</label>
          <input
            type="number"
            min={0}
            max={99}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className={`w-16 h-12 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none transition-colors ${
              isDisabled
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 focus:border-green-500'
            }`}
            aria-label="Gols do time visitante"
            disabled={isDisabled}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-red-600 text-sm text-center">{error}</p>}
      {success && <p role="status" className="text-green-600 text-sm text-center">Palpite enviado!</p>}

      <button
        type="submit"
        disabled={isDisabled || home === '' || away === ''}
        className={`min-h-[48px] w-full font-semibold rounded-lg transition-colors ${
          locked
            ? 'hidden'
            : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
        aria-hidden={locked}
        tabIndex={locked ? -1 : undefined}
      >
        {isPending ? 'Enviando...' : existingPrediction ? 'Atualizar Palpite' : 'Enviar Palpite'}
      </button>
    </form>
  )
}
