'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
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
        router.push('/matches')
      } catch {
        setError('Erro de conexão')
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Entrar</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
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
            <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              required
            />
          </div>

          {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="min-h-[48px] w-full bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-green-700"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/auth/google`}
            className="flex items-center justify-center gap-2 min-h-[48px] w-full border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Entrar com Google
          </a>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Não tem conta?{' '}
          <Link href="/register" className="text-green-600 font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
