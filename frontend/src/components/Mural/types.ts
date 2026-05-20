export interface MuralMatchContext {
  matchId: string
  label: string
}

export interface MuralPostItem {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  content: string
  createdAt: string
  matchContext: MuralMatchContext | null
}
