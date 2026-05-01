'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
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

        router.push('/matches')
      } catch {
        setError('Erro de conexao')
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Criar conta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              required
              minLength={8}
            />
          </div>

          {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="min-h-[48px] w-full bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-green-700"
          >
            {isPending ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Ja tem conta?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
