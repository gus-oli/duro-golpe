import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { matchPredictions } from '../db/schema/index.js'
import { getMatchById } from '../matches/service.js'
import type { MatchPrediction } from '../db/schema/predictions.js'

export interface BatchPredictionInput {
  matchId: string
  predictedHome: number
  predictedAway: number
}

export interface BatchPredictionFailure {
  matchId: string
  message: string
  statusCode: number
}

export interface BatchPredictionResult {
  saved: MatchPrediction[]
  failed: BatchPredictionFailure[]
}

async function assertPredictionOpen(matchId: string) {
  const match = await getMatchById(matchId)
  if (!match) {
    const err = Object.assign(new Error('Partida nao encontrada'), { statusCode: 404 })
    throw err
  }

  if (match.status !== 'SCHEDULED') {
    const err = Object.assign(new Error('Palpites encerrados para esta partida'), { statusCode: 403 })
    throw err
  }

  return match
}

async function getExistingPrediction(userId: string, matchId: string): Promise<MatchPrediction | undefined> {
  const [prediction] = await db
    .select()
    .from(matchPredictions)
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .limit(1)

  return prediction
}

export async function createPrediction(
  userId: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number,
): Promise<MatchPrediction> {
  await assertPredictionOpen(matchId)

  const existing = await getExistingPrediction(userId, matchId)
  if (existing) {
    const err = Object.assign(new Error('Palpite ja enviado para esta partida'), { statusCode: 409 })
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
  await assertPredictionOpen(matchId)

  const [updated] = await db
    .update(matchPredictions)
    .set({ predictedHome, predictedAway, submittedAt: new Date() })
    .where(and(eq(matchPredictions.userId, userId), eq(matchPredictions.matchId, matchId)))
    .returning()

  if (!updated) {
    const err = Object.assign(new Error('Palpite nao encontrado'), { statusCode: 404 })
    throw err
  }

  return updated
}

export async function getPredictionByUser(userId: string, matchId: string): Promise<MatchPrediction | undefined> {
  return getExistingPrediction(userId, matchId)
}

export async function savePredictionsBatch(userId: string, inputs: BatchPredictionInput[]): Promise<BatchPredictionResult> {
  const saved: MatchPrediction[] = []
  const failed: BatchPredictionFailure[] = []

  for (const input of inputs) {
    try {
      await assertPredictionOpen(input.matchId)

      const existing = await getExistingPrediction(userId, input.matchId)
      const prediction = existing
        ? await updatePrediction(userId, input.matchId, input.predictedHome, input.predictedAway)
        : await createPrediction(userId, input.matchId, input.predictedHome, input.predictedAway)

      saved.push(prediction)
    } catch (error) {
      const typedError = error as { message?: string; statusCode?: number }
      failed.push({
        matchId: input.matchId,
        message: typedError.message ?? 'Não foi possível salvar o palpite.',
        statusCode: typedError.statusCode ?? 500,
      })
    }
  }

  return { saved, failed }
}
