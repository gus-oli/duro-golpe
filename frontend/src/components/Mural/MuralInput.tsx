'use client'

import { useRef, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import type { MuralPostItem } from './types'

interface MuralInputProps {
  leagueId: string
  onPost: (post: MuralPostItem) => void
}

const MAX_CHARS = 500

export function MuralInput({ leagueId, onPost }: MuralInputProps) {
  const searchParams = useSearchParams()
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const contextMatchId = searchParams.get('matchId')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!content.trim()) return
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/leagues/${leagueId}/mural`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            matchId: contextMatchId ?? undefined,
          }),
        })

        if (!res.ok) {
          const body = (await res.json()) as { message?: string }
          setError(body.message ?? 'Erro ao enviar mensagem.')
          return
        }

        const post = (await res.json()) as MuralPostItem
        onPost(post)
        setContent('')
        textareaRef.current?.focus()
      } catch {
        setError('Nao foi possivel conectar ao servidor.')
      }
    })
  }

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--line)] p-4">
      <div className="flex flex-col gap-3">
        {contextMatchId && (
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">
            Comentando a partida em foco desta liga
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-[#b42318]">
            {error}
          </p>
        )}

        <label htmlFor="mural-input" className="sr-only">
          Mensagem da liga
        </label>
        <textarea
          id="mural-input"
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Solta a resenha da rodada..."
          rows={3}
          className="min-h-[88px] w-full resize-none rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(48,119,255,0.18)]"
          aria-describedby="char-count"
          maxLength={MAX_CHARS + 10}
        />

        <div className="flex items-center justify-between gap-3">
          <p
            id="char-count"
            className={`text-xs font-medium ${isOverLimit ? 'text-[#b42318]' : 'text-[var(--muted)]'}`}
            aria-live="polite"
          >
            {remaining} caracteres restantes
          </p>

          <button
            type="submit"
            disabled={isPending || !content.trim() || isOverLimit}
            className="dg-button-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </form>
  )
}
