'use client'

import { useState, useTransition, useRef } from 'react'

interface MuralInputProps {
  leagueId: string
  matchId: string
  onPost: (post: { id: string; userId: string; displayName: string; avatarUrl: string | null; content: string; createdAt: string }) => void
}

const MAX_CHARS = 500

export function MuralInput({ leagueId, matchId, onPost }: MuralInputProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/leagues/${leagueId}/matches/${matchId}/mural`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
        if (!res.ok) {
          const body = (await res.json()) as { message?: string }
          setError(body.message ?? 'Erro ao enviar mensagem.')
          return
        }
        const post = (await res.json()) as { id: string; userId: string; displayName: string; avatarUrl: string | null; content: string; createdAt: string }
        onPost(post)
        setContent('')
        textareaRef.current?.focus()
      } catch {
        setError('Não foi possível conectar ao servidor.')
      }
    })
  }

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex flex-col gap-2">
      {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label htmlFor="mural-input" className="sr-only">Comentário</label>
          <textarea
            id="mural-input"
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={2}
            className="w-full resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[48px]"
            aria-describedby="char-count"
            maxLength={MAX_CHARS + 10}
          />
          <p
            id="char-count"
            className={`text-xs mt-0.5 text-right ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}
            aria-live="polite"
          >
            {remaining} caracteres restantes
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || !content.trim() || isOverLimit}
          className="min-h-[48px] px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isPending ? '...' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}
