'use client'

import { useState } from 'react'
import { PageShell } from '@/components/ui/Primitives'

export default function JoinLeaguePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
      })

      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        if (res.status === 404) {
          setError('Codigo de convite invalido.')
        } else if (res.status === 409) {
          setError('Você já faz parte desta liga.')
        } else {
          setError(body.message ?? 'Erro ao entrar na liga.')
        }
        return
      }

      const data = (await res.json()) as { leagueId: string }
      window.location.assign(`/leagues/${data.leagueId}`)
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Convite</p>
          <h1 className="mt-2 text-3xl font-black">Entrar em uma Liga</h1>
          <p className="mt-2 text-sm leading-6 text-white/72">Use o codigo do grupo e entre direto na tabela.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" noValidate>
          <div>
            <label htmlFor="invite-code" className="dg-label">Codigo de Convite</label>
            <input
              id="invite-code"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={8}
              required
              placeholder="Ex: AB3KX7Z2"
              className="dg-input text-center font-mono text-lg font-black uppercase tracking-[0.18em]"
            />
            <p className="mt-2 text-xs font-medium text-[var(--muted)]">8 caracteres, maiusculos e numeros</p>
          </div>

          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

          <button type="submit" disabled={isSubmitting || inviteCode.length !== 8} className="dg-button-primary w-full">
            {isSubmitting ? 'Entrando...' : 'Entrar na Liga'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}
