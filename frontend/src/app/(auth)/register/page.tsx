'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PageShell } from '@/components/ui/Primitives'
import { PasswordField } from '@/components/ui/PasswordField'
import { getPasswordPolicyStatus, isStrongPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/password-policy'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const passwordStatus = getPasswordPolicyStatus(password)
  const passwordIsStrong = isStrongPassword(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordIsStrong) {
      setError(PASSWORD_POLICY_MESSAGE)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas precisam ser iguais.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar conta')
        return
      }

      window.location.assign('/matches')
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Copa 2026</p>
          <h1 className="mt-2 text-3xl font-black">Criar conta</h1>
          <p className="mt-2 text-sm leading-6 text-white/72">Entre no bolao antes do apito inicial.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <label htmlFor="displayName" className="dg-label">Nome</label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="dg-input"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              required
              minLength={8}
              describedBy="password-rules"
            />
            <div id="password-rules" className="mt-3 space-y-2">
              {passwordStatus.map((rule) => (
                <p
                  key={rule.id}
                  className={
                    rule.passed
                      ? 'text-sm font-medium text-[var(--pitch-dark)]'
                      : 'text-sm font-medium text-[var(--muted)]'
                  }
                >
                  {rule.passed ? 'OK' : 'Falta'}: {rule.label}
                </p>
              ))}
            </div>
          </div>

          <div>
            <PasswordField
              id="confirmPassword"
              label="Confirmar senha"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              minLength={8}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-2 text-sm font-medium text-red-700">As senhas precisam ser iguais.</p>
            )}
          </div>

          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

          <button type="submit" disabled={isSubmitting || !passwordIsStrong || !passwordsMatch} className="dg-button-primary w-full">
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm font-medium text-[var(--muted)]">
            Já tem conta?{' '}
            <Link href="/login" className="font-black text-[var(--pitch-dark)] hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
