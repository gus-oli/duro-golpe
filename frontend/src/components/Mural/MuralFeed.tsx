'use client'

import { useEffect, useRef, useState } from 'react'
import { MuralInput } from './MuralInput'
import { MuralPost } from './MuralPost'
import type { MuralPostItem } from './types'
import { mergeIncomingPosts, mergeSinglePost, sortChronologically } from './feed-state'
import { useWebSocket } from '@/hooks/useWebSocket'

interface MuralFeedProps {
  leagueId: string
  initialPosts: MuralPostItem[]
  currentUserId: string
  realtimeEnabled: boolean
}

function isNearBottom(element: HTMLElement | null) {
  if (!element) return true
  return element.scrollHeight - element.scrollTop - element.clientHeight < 48
}

function isMuralPollingEnabled(realtimeEnabled: boolean): boolean {
  const flag = process.env['NEXT_PUBLIC_MURAL_POLLING_ENABLED']
  if (flag == null) {
    return !realtimeEnabled
  }

  return flag.toLowerCase() === 'true'
}

interface MuralPostNewEvent {
  type: 'mural:post:new'
  leagueId: string
  post: MuralPostItem
}

export function MuralFeed({ leagueId, initialPosts, currentUserId, realtimeEnabled }: MuralFeedProps) {
  const [posts, setPosts] = useState<MuralPostItem[]>(sortChronologically(initialPosts))
  const [freshIds, setFreshIds] = useState<string[]>([])
  const [newPostsCount, setNewPostsCount] = useState(0)
  const listRef = useRef<HTMLUListElement | null>(null)
  const boostPollingUntil = useRef(0)
  const newestTimestampRef = useRef(posts.at(-1)?.createdAt ?? null)
  const shouldStickToBottomRef = useRef(true)
  const justAppendedRef = useRef(false)
  const fastPollingUntilRef = useRef(0)
  const pollingEnabled = isMuralPollingEnabled(realtimeEnabled)

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | null = null
    let idleSince = Date.now()

    async function refreshFeed() {
      try {
        const params = new URLSearchParams({ limit: '50' })
        if (newestTimestampRef.current) {
          params.set('after', newestTimestampRef.current)
        }

        const res = await fetch(`/api/leagues/${leagueId}/mural?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok || cancelled) return

        const result = (await res.json()) as { posts: MuralPostItem[] }
        if (cancelled) return

        setPosts((prev) => {
          const nearBottom = isNearBottom(listRef.current)
          const merged = mergeIncomingPosts(prev, result.posts)

          if (merged.freshIds.length > 0) {
            setFreshIds((existing) => Array.from(new Set([...existing, ...merged.freshIds])))

            if (!nearBottom) {
              setNewPostsCount((count) => count + merged.freshIds.length)
            } else {
              shouldStickToBottomRef.current = true
            }

            justAppendedRef.current = true
            idleSince = Date.now()
          }

          return merged.posts
        })
      } catch {
        // keep current feed; next focus/poll will try again
      }
    }

    function currentDelay() {
      if (document.visibilityState !== 'visible') return 30000
      if (Date.now() < boostPollingUntil.current) return 2000
      if (Date.now() < fastPollingUntilRef.current) return 3000
      if (Date.now() - idleSince > 45000) return realtimeEnabled ? 10000 : 12000
      return realtimeEnabled ? 5000 : 8000
    }

    function scheduleNext() {
      if (cancelled || !pollingEnabled) return
      timeoutId = window.setTimeout(async () => {
        timeoutId = null
        await refreshFeed()
        scheduleNext()
      }, currentDelay())
    }

    function handleFocus() {
      if (document.visibilityState !== 'visible') return
      fastPollingUntilRef.current = Date.now() + 20_000
      void refreshFeed()
      if (pollingEnabled && timeoutId == null) {
        scheduleNext()
      }
    }

    if (pollingEnabled) {
      void refreshFeed()
      scheduleNext()
    }

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
  }, [leagueId, realtimeEnabled, pollingEnabled])

  useWebSocket(
    realtimeEnabled,
    {
      'mural:post:new': (data) => {
        const event = data as MuralPostNewEvent
        if (event.leagueId !== leagueId) return

        setPosts((prev) => {
          const nearBottom = isNearBottom(listRef.current)
          const alreadyPresent = prev.some((post) => post.id === event.post.id)
          const next = mergeSinglePost(prev, event.post)

          if (!alreadyPresent) {
            setFreshIds((existing) => Array.from(new Set([...existing, event.post.id])))

            if (!nearBottom) {
              setNewPostsCount((count) => count + 1)
            } else {
              shouldStickToBottomRef.current = true
            }

            justAppendedRef.current = true
          }

          return next
        })
      },
    },
    {
      subscriptions: [{ type: 'subscribe:mural', leagueId }],
    },
  )

  useEffect(() => {
    if (freshIds.length === 0) return
    const timer = window.setTimeout(() => setFreshIds([]), 4000)
    return () => window.clearTimeout(timer)
  }, [freshIds])

  useEffect(() => {
    newestTimestampRef.current = posts.at(-1)?.createdAt ?? null

    if (!justAppendedRef.current) return

    if (shouldStickToBottomRef.current) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      setNewPostsCount(0)
    }

    justAppendedRef.current = false
  }, [posts])

  function handleOwnPost(post: MuralPostItem) {
    setPosts((prev) => mergeSinglePost(prev, post))
    setFreshIds((existing) => Array.from(new Set([...existing, post.id])))
    boostPollingUntil.current = Date.now() + 30_000
    shouldStickToBottomRef.current = true
    justAppendedRef.current = true
  }

  function handleJumpToLatest() {
    shouldStickToBottomRef.current = true
    listRef.current?.scrollTo({ top: listRef.current?.scrollHeight ?? 0, behavior: 'smooth' })
    setNewPostsCount(0)
  }

  function handleScroll() {
    shouldStickToBottomRef.current = isNearBottom(listRef.current)
    if (shouldStickToBottomRef.current) {
      setNewPostsCount(0)
    }
  }

  return (
    <section aria-label="Mural da liga" className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
        <span>Mural da liga</span>
        {newPostsCount > 0 ? (
          <button type="button" onClick={handleJumpToLatest} className="text-[var(--accent-strong)]">
            {newPostsCount} nova{newPostsCount > 1 ? 's' : ''} mensagem{newPostsCount > 1 ? 'ens' : ''}
          </button>
        ) : (
          <span>Resenha rolando</span>
        )}
      </div>

      <ul
        ref={listRef}
        onScroll={handleScroll}
        className="flex max-h-[60vh] flex-1 flex-col gap-3 overflow-y-auto p-4"
        aria-live="polite"
      >
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
