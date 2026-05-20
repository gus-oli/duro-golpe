import type { MuralPostItem } from './types'

export function sortChronologically(posts: MuralPostItem[]) {
  return [...posts].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
}

export function mergeSinglePost(posts: MuralPostItem[], post: MuralPostItem) {
  return sortChronologically([...posts.filter((existing) => existing.id !== post.id), post])
}

export function mergeIncomingPosts(posts: MuralPostItem[], incoming: MuralPostItem[]) {
  const merged = [...posts]
  const freshIds: string[] = []

  for (const post of incoming) {
    const existing = merged.findIndex((candidate) => candidate.id === post.id)
    if (existing >= 0) {
      merged[existing] = post
      continue
    }

    merged.push(post)
    freshIds.push(post.id)
  }

  return {
    posts: sortChronologically(merged),
    freshIds,
  }
}
