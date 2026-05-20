'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PageShell } from '@/components/ui/Primitives'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('Link de recuperação inválido.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas precisam ser iguais.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = (await res.json()) as { message?: string }

      if (!res.ok) {
        setError(data.message ?? 'Nao foi possivel redefinir a senha.')
        return
      }

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
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
          <h1 className="mt-2 text-3xl font-black">Nova senha</h1>
          <p className="mt-2 text-sm leading-6 text-white/72">Feche a resenha com uma senha nova e segura.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <label htmlFor="password" className="dg-label">Nova senha</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dg-input"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="dg-label">Confirmar senha</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="dg-input"
              required
              minLength={8}
            />
          </div>

          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
          {success && (
            <p role="status" className="rounded-md border border-[rgba(12,143,79,0.22)] bg-[rgba(12,143,79,0.1)] px-3 py-2 text-sm font-bold text-[var(--pitch-dark)]">
              Senha redefinida. Agora voce ja pode entrar.
            </p>
          )}

          <button type="submit" disabled={isSubmitting || success} className="dg-button-primary w-full">
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </button>

          <p className="text-center text-sm font-medium text-[var(--muted)]">
            <Link href="/login" className="font-black text-[var(--pitch-dark)] hover:underline">
              Voltar para login
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
