export interface LeagueOwnership {
  createdBy: string
}

export function canDeleteLeague(currentUserId: string | null | undefined, league: LeagueOwnership): boolean {
  return Boolean(currentUserId) && league.createdBy === currentUserId
}
