import { describe, expect, it } from 'vitest'
import { mergeIncomingPosts, mergeSinglePost, sortChronologically } from '../../src/components/Mural/feed-state'

const basePosts = [
  {
    id: '1',
    userId: 'u1',
    displayName: 'Ana',
    avatarUrl: null,
    content: 'primeira',
    createdAt: '2026-05-20T10:00:00.000Z',
    matchContext: null,
  },
  {
    id: '2',
    userId: 'u2',
    displayName: 'Beto',
    avatarUrl: null,
    content: 'segunda',
    createdAt: '2026-05-20T10:01:00.000Z',
    matchContext: null,
  },
]

describe('mural feed state', () => {
  it('sorts posts from oldest to newest', () => {
    const sorted = sortChronologically([...basePosts].reverse())
    expect(sorted.map((post) => post.id)).toEqual(['1', '2'])
  })

  it('appends a new post without duplicating ids', () => {
    const merged = mergeSinglePost(basePosts, {
      ...basePosts[1],
      id: '3',
      createdAt: '2026-05-20T10:02:00.000Z',
    })
    expect(merged.map((post) => post.id)).toEqual(['1', '2', '3'])
  })

  it('merges incoming posts, keeps chronology and reports only fresh ids', () => {
    const result = mergeIncomingPosts(basePosts, [
      { ...basePosts[1], content: 'segunda editada' },
      {
        id: '3',
        userId: 'u3',
        displayName: 'Caio',
        avatarUrl: null,
        content: 'terceira',
        createdAt: '2026-05-20T10:03:00.000Z',
        matchContext: null,
      },
    ])

    expect(result.posts.map((post) => post.id)).toEqual(['1', '2', '3'])
    expect(result.posts[1]?.content).toBe('segunda editada')
    expect(result.freshIds).toEqual(['3'])
  })
})
