import { redirect } from 'next/navigation'

export default async function LegacyMuralPage({
  params,
}: {
  params: Promise<{ matchId: string; leagueId: string }>
}) {
  const { matchId, leagueId } = await params
  redirect(`/leagues/${leagueId}?matchId=${matchId}#social-feed`)
}
