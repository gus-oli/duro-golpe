'use client'

import { useState, useRef } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { MuralPost } from './MuralPost'
import { MuralInput } from './MuralInput'

interface Post {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: string
}

interface MuralFeedProps {
  leagueId: string
  matchId: string
  initialPosts: Post[]
  currentUserId: string
  token: string
}

interface MuralPostNewEvent {
  type: 'mural:post:new'
  leagueId: string
  matchId: string
  post: Post
}

export function MuralFeed({ leagueId, matchId, initialPosts, currentUserId, token }: MuralFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const bottomRef = useRef<HTMLDivElement>(null)

  useWebSocket(token, {
    'mural:post:new': (data) => {
      const event = data as MuralPostNewEvent
      if (event.leagueId === leagueId && event.matchId === matchId) {
        setPosts((prev) => [event.post, ...prev])
      }
    },
  }, {
    subscriptions: [{ type: 'subscribe:mural', leagueId, matchId }],
  })

  function handleOwnPost(post: Post) {
    setPosts((prev) => [post, ...prev])
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <section aria-label="Mural de Resenha" className="flex flex-col h-full">
      <ul
        className="flex-1 overflow-y-auto flex flex-col-reverse gap-3 p-4 min-h-[200px] max-h-[60vh]"
        aria-live="polite"
        aria-label="Comentários"
      >
        {posts.length === 0 && (
          <li className="text-center text-gray-400 text-sm py-8">
            Nenhum comentário ainda. Seja o primeiro!
          </li>
        )}
        {posts.map((post) => (
          <MuralPost key={post.id} {...post} currentUserId={currentUserId} />
        ))}
        <div ref={bottomRef} />
      </ul>

      <MuralInput leagueId={leagueId} matchId={matchId} onPost={handleOwnPost} />
    </section>
  )
}
