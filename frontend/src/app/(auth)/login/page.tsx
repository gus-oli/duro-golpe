'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageShell } from '@/components/ui/Primitives'
import { PasswordField } from '@/components/ui/PasswordField'
import { getSafeLoginRedirectTarget } from '@/lib/proxy-security'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Erro ao fazer login')
        return
      }

      window.location.assign(getSafeLoginRedirectTarget(searchParams.get('from')))
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell narrow className="flex items-center">
      <div className="dg-surface mx-auto w-full max-w-md overflow-hidden">
        <div className="bg-[linear-gradient(135deg,var(--night),var(--pitch-dark))] px-6 py-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Duro Golpe</p>
          <h1 className="mt-2 text-3xl font-black">Entrar</h1>
          <p className="mt-2 text-sm leading-6 text-white/72">Volte para a mesa de palpites.</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div>
              <PasswordField
                id="password"
                label="Senha"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                required
              />
            </div>

            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="dg-button-primary w-full">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-medium text-[var(--muted)]">
            <Link href="/forgot-password" className="font-black text-[var(--pitch-dark)] hover:underline">
              Esqueci minha senha
            </Link>
          </p>

          <p className="mt-6 text-center text-sm font-medium text-[var(--muted)]">
            Não tem conta?{' '}
            <Link href="/register" className="font-black text-[var(--pitch-dark)] hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  )
}
