import { db } from '../db/index.js'
import { matchPredictions } from '../db/schema/index.js'
import { getMatchById } from '../matches/service.js'
import { eq, and } from 'drizzle-orm'
import type { MatchPrediction } from '../db/schema/predictions.js'

export async function createPrediction(
  userId: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number,
): Promise<MatchPrediction> {
  const match = await getMatchById(matchId)
  if (!match) {
    const err = Object.assign(new Error('Partida não encontrada'), { statusCode: 404 })
    throw err
  }
  if (match.status !== 'SCHEDULED') {
    const err = Object.assign(new Error('Palpites encerrados para esta partida'), { statusCode: 403 })
    throw err
  }

  const existing = await db
    .select()
    .from(matchPredictions)
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .limit(1)

  if (existing.length > 0) {
    const err = Object.assign(new Error('Palpite já enviado para esta partida'), { statusCode: 409 })
    throw err
  }

  const [prediction] = await db
    .insert(matchPredictions)
    .values({ userId, matchId, predictedHome, predictedAway })
    .returning()

  return prediction!
}

export async function updatePrediction(
  userId: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number,
): Promise<MatchPrediction> {
  const match = await getMatchById(matchId)
  if (!match) {
    const err = Object.assign(new Error('Partida não encontrada'), { statusCode: 404 })
    throw err
  }
  if (match.status !== 'SCHEDULED') {
    const err = Object.assign(new Error('Palpites encerrados para esta partida'), { statusCode: 403 })
    throw err
  }

  const [updated] = await db
    .update(matchPredictions)
    .set({ predictedHome, predictedAway, submittedAt: new Date() })
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .returning()

  if (!updated) {
    const err = Object.assign(new Error('Palpite não encontrado'), { statusCode: 404 })
    throw err
  }

  return updated
}

export async function getPredictionByUser(userId: string, matchId: string): Promise<MatchPrediction | undefined> {
  const [prediction] = await db
    .select()
    .from(matchPredictions)
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .limit(1)
  return prediction
}
