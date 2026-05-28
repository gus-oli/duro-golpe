'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StatusPill } from '@/components/ui/Primitives'
import { PasswordField } from '@/components/ui/PasswordField'
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/password-policy'

interface AccountProfile {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}

function Message({
  tone,
  children,
}: {
  tone: 'error' | 'success'
  children: string
}) {
  return (
    <p
      className={
        tone === 'error'
          ? 'rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700'
          : 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700'
      }
    >
      {children}
    </p>
  )
}

export function ProfileSettingsForm({ initialProfile }: { initialProfile: AccountProfile }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(initialProfile.displayName)
  const [email, setEmail] = useState(initialProfile.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, email }),
    })

    const data = (await res.json()) as { message?: string; user?: AccountProfile }
    if (!res.ok) {
      setProfileError(data.message ?? 'Nao foi possivel atualizar seu perfil.')
      return
    }

    setProfileSuccess('Perfil atualizado.')
    if (data.user) {
      setDisplayName(data.user.displayName)
      setEmail(data.user.email)
    }
    startTransition(() => router.refresh())
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!isStrongPassword(newPassword)) {
      setPasswordError(PASSWORD_POLICY_MESSAGE)
      return
    }

    const res = await fetch('/api/me/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = (await res.json()) as { message?: string }
    if (!res.ok) {
      setPasswordError(data.message ?? 'Nao foi possivel trocar a senha.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setPasswordSuccess('Senha atualizada.')
  }

  return (
    <div className="space-y-6">
      <section className="dg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="dg-eyebrow">Identidade</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Dados da conta</h2>
          </div>
          <StatusPill tone="neutral">{isPending ? 'Atualizando...' : 'Editavel'}</StatusPill>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="displayName" className="dg-label">
                Apelido
              </label>
              <input
                id="displayName"
                className="dg-input"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                minLength={2}
                maxLength={50}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="dg-label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="dg-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          {profileError && <Message tone="error">{profileError}</Message>}
          {profileSuccess && <Message tone="success">{profileSuccess}</Message>}

          <div className="flex justify-end">
            <button type="submit" className="dg-button-primary" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar dados'}
            </button>
          </div>
        </form>
      </section>

      <section className="dg-surface p-5 sm:p-6">
        <div>
          <p className="dg-eyebrow">Seguranca</p>
          <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">Trocar senha</h2>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <PasswordField
                id="currentPassword"
                label="Senha atual"
                value={currentPassword}
                onChange={setCurrentPassword}
                required
              />
            </div>
            <div>
              <PasswordField
                id="newPassword"
                label="Nova senha"
                value={newPassword}
                onChange={setNewPassword}
                minLength={8}
                required
              />
            </div>
          </div>

          {passwordError && <Message tone="error">{passwordError}</Message>}
          {passwordSuccess && <Message tone="success">{passwordSuccess}</Message>}

          <div className="flex justify-end">
            <button type="submit" className="dg-button-primary">
              Atualizar senha
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
