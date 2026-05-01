'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinLeaguePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/leagues/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
        })

        if (!res.ok) {
          const body = (await res.json()) as { message?: string }
          if (res.status === 404) {
            setError('Código de convite inválido.')
          } else if (res.status === 409) {
            setError('Você já faz parte desta liga.')
          } else {
            setError(body.message ?? 'Erro ao entrar na liga.')
          }
          return
        }

        const data = (await res.json()) as { leagueId: string }
        router.push(`/leagues/${data.leagueId}`)
      } catch {
        setError('Não foi possível conectar ao servidor.')
      }
    })
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Entrar em uma Liga</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">
            Código de Convite
          </label>
          <input
            id="invite-code"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            maxLength={8}
            required
            placeholder="Ex: AB3KX7Z2"
            className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
          />
          <p className="text-xs text-gray-400 mt-1">8 caracteres, maiúsculos e números</p>
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || inviteCode.length !== 8}
          className="min-h-[48px] bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Entrando...' : 'Entrar na Liga'}
        </button>
      </form>
    </main>
  )
}
