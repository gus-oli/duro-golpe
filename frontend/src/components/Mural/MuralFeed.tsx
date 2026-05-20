'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MuralInput } from './MuralInput'
import { MuralPost } from './MuralPost'
import type { MuralPostItem } from './types'

interface MuralFeedProps {
  leagueId: string
  initialPosts: MuralPostItem[]
  currentUserId: string
  realtimeEnabled: boolean
}

function mergePost(posts: MuralPostItem[], post: MuralPostItem) {
  return [post, ...posts.filter((existing) => existing.id !== post.id)]
}

function mergePosts(posts: MuralPostItem[], incoming: MuralPostItem[]) {
  const merged = [...posts]
  const freshIds: string[] = []

  for (const post of incoming) {
    const existing = merged.findIndex((candidate) => candidate.id === post.id)
    if (existing >= 0) {
      merged[existing] = post
      continue
    }

    merged.unshift(post)
    freshIds.push(post.id)
  }

  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return { posts: merged, freshIds }
}

export function MuralFeed({ leagueId, initialPosts, currentUserId, realtimeEnabled }: MuralFeedProps) {
  const [posts, setPosts] = useState<MuralPostItem[]>(initialPosts)
  const [freshIds, setFreshIds] = useState<string[]>([])
  const [newPostsCount, setNewPostsCount] = useState(0)
  const listRef = useRef<HTMLUListElement | null>(null)
  const boostPollingUntil = useRef(0)
  const lastKnownId = useMemo(() => posts[0]?.id ?? null, [posts])

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | null = null

    async function refreshFeed() {
      try {
        const res = await fetch(`/api/leagues/${leagueId}/mural?limit=50`, { cache: 'no-store' })
        if (!res.ok || cancelled) return

        const result = (await res.json()) as { posts: MuralPostItem[] }
        if (cancelled) return

        setPosts((prev) => {
          const previousTopId = prev[0]?.id ?? null
          const nearTop = listRef.current ? listRef.current.scrollTop < 24 : true
          const merged = mergePosts(prev, result.posts)

          if (merged.freshIds.length > 0) {
            setFreshIds((existing) => Array.from(new Set([...existing, ...merged.freshIds])))

            const containsBrandNewTop = previousTopId && merged.freshIds.some((id) => id !== previousTopId)
            if (!nearTop && containsBrandNewTop) {
              setNewPostsCount((count) => count + merged.freshIds.length)
            }
          }

          return merged.posts
        })
      } catch {
        // keep current feed; next focus/poll will try again
      }
    }

    function currentDelay() {
      return Date.now() < boostPollingUntil.current ? 5000 : realtimeEnabled ? 10000 : 15000
    }

    function scheduleNext() {
      if (cancelled || document.visibilityState !== 'visible') return
      timeoutId = window.setTimeout(async () => {
        timeoutId = null
        await refreshFeed()
        scheduleNext()
      }, currentDelay())
    }

    function handleFocus() {
      if (document.visibilityState !== 'visible') return
      void refreshFeed()
      if (timeoutId == null) {
        scheduleNext()
      }
    }

    void refreshFeed()
    scheduleNext()
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      cancelled = true
      if (timeoutId != null) {
        window.clearTimeout(timeoutId)
      }
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [leagueId, realtimeEnabled])

  useEffect(() => {
    if (freshIds.length === 0) return
    const timer = window.setTimeout(() => setFreshIds([]), 4000)
    return () => window.clearTimeout(timer)
  }, [freshIds])

  function handleOwnPost(post: MuralPostItem) {
    setPosts((prev) => mergePost(prev, post))
    setFreshIds((existing) => Array.from(new Set([...existing, post.id])))
    boostPollingUntil.current = Date.now() + 30_000
  }

  function handleJumpToLatest() {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setNewPostsCount(0)
  }

  return (
    <section aria-label="Mural da liga" className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
        <span>{lastKnownId ? 'Atualizando resenha da liga' : 'Mural da liga'}</span>
        {newPostsCount > 0 ? (
          <button type="button" onClick={handleJumpToLatest} className="text-[var(--accent-strong)]">
            {newPostsCount} nova{newPostsCount > 1 ? 's' : ''} mensagem{newPostsCount > 1 ? 'ens' : ''}
          </button>
        ) : (
          <span>{realtimeEnabled ? 'polling a cada 10s' : 'polling a cada 15s'}</span>
        )}
      </div>

      <ul ref={listRef} className="flex max-h-[60vh] flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
        {posts.length === 0 && (
          <li className="py-8 text-center text-sm text-[var(--muted)]">
            Nenhuma mensagem ainda. A primeira resenha da liga pode ser sua.
          </li>
        )}
        {posts.map((post) => (
          <MuralPost key={post.id} {...post} currentUserId={currentUserId} isFresh={freshIds.includes(post.id)} />
        ))}
      </ul>

      <MuralInput leagueId={leagueId} onPost={handleOwnPost} />
    </section>
  )
}
