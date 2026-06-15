'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

interface LeagueDeleteControlProps {
  leagueId: string
  leagueName: string
}

export function LeagueDeleteControl({ leagueId, leagueName }: LeagueDeleteControlProps) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canDelete = useMemo(() => confirmation.trim() === leagueName, [confirmation, leagueName])

  async function handleDelete() {
    if (!canDelete || isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/leagues/${leagueId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null
        setError(data?.message ?? 'Nao foi possivel excluir a liga.')
        return
      }

      router.replace('/leagues')
      router.refresh()
    } catch {
      setError('Nao foi possivel excluir a liga.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="dg-surface border-red-200 bg-red-50/70 p-4" aria-label="Excluir liga">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Zona de risco</p>
          <h2 className="mt-1 text-xl font-black text-red-950">Excluir liga</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-900">
            Isso remove a liga, seus membros e o mural. Palpites, pontos, badges e contas dos usuarios continuam salvos.
          </p>
          <label htmlFor="delete-league-confirmation" className="dg-label mt-4 block text-red-950">
            Digite o nome da liga para confirmar
          </label>
          <input
            id="delete-league-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="dg-input mt-2 border-red-200 bg-white"
            placeholder={leagueName}
            disabled={isDeleting}
          />
          {error && <p className="mt-2 text-sm font-bold text-red-700">{error}</p>}
        </div>

        <button
          type="button"
          className="min-h-[48px] rounded-md bg-red-700 px-5 py-3 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canDelete || isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir liga'}
        </button>
      </div>
    </section>
  )
}
