'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PageShell } from '@/components/ui/Primitives'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { message?: string }

      if (!res.ok) {
        setError(data.message ?? 'Nao foi possivel enviar o link.')
        return
      }

      setSuccess(data.message ?? 'Se o e-mail existir, enviaremos um link de recuperação.')
    } catch {
      setError('Erro de conexao')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell narrow className="flex items-center">
      <div className="dg-surface mx-auto w-full max-w-md overflow-hidden">
        <div className="bg-[linear-gradient(135deg,var(--night),var(--pitch-dark))] px-6 py-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Duro Golpe</p>
          <h1 className="mt-2 text-3xl font-black">Recuperar senha</h1>
          <p className="mt-2 text-sm leading-6 text-white/72">Enviamos um link para voce voltar para o jogo.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <label htmlFor="email" className="dg-label">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="dg-input"
              required
            />
          </div>

          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
          {success && <p role="status" className="rounded-md border border-[rgba(12,143,79,0.22)] bg-[rgba(12,143,79,0.1)] px-3 py-2 text-sm font-bold text-[var(--pitch-dark)]">{success}</p>}

          <button type="submit" disabled={isSubmitting} className="dg-button-primary w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </button>

          <p className="text-center text-sm font-medium text-[var(--muted)]">
            Lembrou da senha?{' '}
            <Link href="/login" className="font-black text-[var(--pitch-dark)] hover:underline">
              Voltar para login
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
