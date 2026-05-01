'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function NewLeaguePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/leagues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })

        if (!res.ok) {
          const body = (await res.json()) as { message?: string }
          setError(body.message ?? 'Erro ao criar liga.')
          return
        }

        const league = (await res.json()) as { id: string }
        router.push(`/leagues/${league.id}`)
      } catch {
        setError('Não foi possível conectar ao servidor.')
      }
    })
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nova Liga</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="league-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Liga
          </label>
          <input
            id="league-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={50}
            required
            placeholder="Ex: Galera do Escritório"
            className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || name.length < 3}
          className="min-h-[48px] bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Criando...' : 'Criar Liga'}
        </button>
      </form>
    </main>
  )
}
