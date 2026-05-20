'use client'

import { useState } from 'react'
import { PageShell } from '@/components/ui/Primitives'

export default function NewLeaguePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

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
      window.location.assign(`/leagues/${league.id}`)
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell narrow>
      <div className="dg-surface mx-auto w-full max-w-lg overflow-hidden">
        <div className="bg-[linear-gradient(135deg,var(--night),var(--pitch-dark))] px-6 py-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Nova disputa</p>
          <h1 className="mt-2 text-3xl font-black">Nova Liga</h1>
          <p className="mt-2 text-sm leading-6 text-white/72">Crie uma tabela privada para acompanhar a Copa com seu grupo.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" noValidate>
          <div>
            <label htmlFor="league-name" className="dg-label">Nome da Liga</label>
            <input
              id="league-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={3}
              maxLength={50}
              required
              placeholder="Ex: Galera do Escritorio"
              className="dg-input"
            />
          </div>

          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

          <button type="submit" disabled={isSubmitting || name.length < 3} className="dg-button-primary w-full">
            {isSubmitting ? 'Criando...' : 'Criar Liga'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}
