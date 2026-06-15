import bcrypt from 'bcryptjs'
import { eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  leagueMemberships,
  leagues,
  matchPredictions,
  matchResults,
  matchScores,
  matchSocialOddsSnapshots,
  muralPosts,
  outrightMarketResults,
  outrightMarkets,
  outrightOptions,
  outrightPredictions,
  outrightScores,
  userBadges,
  userTotals,
  users,
} from '../db/schema/index.js'
import {
  buildDemoMatches,
  DEMO_BADGES,
  DEMO_LEAGUES,
  DEMO_LEAGUE_POSTS,
  DEMO_MATCH_FIXTURES,
  DEMO_OUTRIGHT_MARKETS,
  DEMO_OUTRIGHT_PREDICTIONS,
  DEMO_PASSWORD,
  DEMO_PREDICTIONS,
  DEMO_TEAMS,
  DEMO_USERS,
} from '../seeds/demo-dataset.js'
import { seedCatalogs, upsertMatches, upsertTeams } from '../seeds/support.js'
import { score as scoreMatchPrediction } from '../scoring/engine.js'
import { recomputeUserTotal } from '../scoring/totals.js'
import { calculateOutrightPoints } from '../outrights/resolution.js'
import type { OutrightMarketCode } from '../outrights/catalog.js'
import { createOrUpdateSocialOddsSnapshot } from '../matches/social-odds.js'

function requireRecordValue<T>(record: Record<string, T>, key: string, label: string): T {
  const value = record[key]
  if (!value) {
    throw new Error(`Missing ${label} for key "${key}"`)
  }

  return value
}

function requireNestedRecordValue(
  record: Record<string, Record<string, string>>,
  parentKey: string,
  childKey: string,
  label: string,
): string {
  const nested = record[parentKey]
  if (!nested) {
    throw new Error(`Missing ${label} container for key "${parentKey}"`)
  }

  const value = nested[childKey]
  if (!value) {
    throw new Error(`Missing ${label} value for key "${parentKey}:${childKey}"`)
  }

  return value
}

function groupByStatus(matchIdsByApiFootballId: Record<string, string>): Record<string, string[]> {
  return DEMO_MATCH_FIXTURES.reduce<Record<string, string[]>>((acc, fixture) => {
    const matchId = matchIdsByApiFootballId[fixture.apiFootballId]
    if (!matchId) {
      return acc
    }

    if (!acc[fixture.status]) {
      acc[fixture.status] = []
    }

    acc[fixture.status]!.push(matchId)
    return acc
  }, {})
}

async function upsertDemoUsers(): Promise<Record<string, string>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const idsByEmail: Record<string, string> = {}

  for (const user of DEMO_USERS) {
    const [row] = await db
      .insert(users)
      .values({
        email: user.email,
        displayName: user.displayName,
        passwordHash,
        avatarUrl: user.avatarUrl,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          displayName: user.displayName,
          passwordHash,
          avatarUrl: user.avatarUrl,
        },
      })
      .returning({ id: users.id })

    if (!row?.id) {
      throw new Error(`Unable to upsert demo user ${user.email}`)
    }

    idsByEmail[user.email] = row.id
  }

  return idsByEmail
}

async function upsertDemoLeagues(userIdsByEmail: Record<string, string>): Promise<Record<string, string>> {
  const leagueIdsByKey: Record<string, string> = {}

  for (const leagueFixture of DEMO_LEAGUES) {
    const createdBy = requireRecordValue(userIdsByEmail, leagueFixture.createdByEmail, 'user id')
    const [row] = await db
      .insert(leagues)
      .values({
        name: leagueFixture.name,
        inviteCode: leagueFixture.inviteCode,
        createdBy,
      })
      .onConflictDoUpdate({
        target: leagues.inviteCode,
        set: {
          name: leagueFixture.name,
          createdBy,
        },
      })
      .returning({ id: leagues.id })

    if (!row?.id) {
      throw new Error(`Unable to upsert league ${leagueFixture.inviteCode}`)
    }

    leagueIdsByKey[leagueFixture.key] = row.id
  }

  const leagueIds = Object.values(leagueIdsByKey)
  if (leagueIds.length > 0) {
    await db.delete(leagueMemberships).where(inArray(leagueMemberships.leagueId, leagueIds))
  }

  for (const leagueFixture of DEMO_LEAGUES) {
    const leagueId = requireRecordValue(leagueIdsByKey, leagueFixture.key, 'league id')
    const membershipRows = leagueFixture.memberEmails.map((memberEmail, index) => ({
      leagueId,
      userId: requireRecordValue(userIdsByEmail, memberEmail, 'user id'),
      isActive: true,
      joinedAt: new Date(Date.UTC(2026, 4, 1 + index, 18, 0, 0)),
    }))

    await db.insert(leagueMemberships).values(membershipRows)
  }

  return leagueIdsByKey
}

async function clearDemoState(matchIds: string[], userIds: string[], leagueIds: string[]): Promise<void> {
  if (leagueIds.length > 0) {
    await db.delete(muralPosts).where(inArray(muralPosts.leagueId, leagueIds))
  }

  if (matchIds.length > 0) {
    await db.delete(matchSocialOddsSnapshots).where(inArray(matchSocialOddsSnapshots.matchId, matchIds))
    await db.delete(matchScores).where(inArray(matchScores.matchId, matchIds))
    await db.delete(matchResults).where(inArray(matchResults.matchId, matchIds))
    await db.delete(matchPredictions).where(inArray(matchPredictions.matchId, matchIds))
  }

  if (userIds.length > 0) {
    await db.delete(matchScores).where(inArray(matchScores.userId, userIds))
    await db.delete(matchPredictions).where(inArray(matchPredictions.userId, userIds))
    await db.delete(outrightPredictions).where(inArray(outrightPredictions.userId, userIds))
    await db.delete(outrightScores).where(inArray(outrightScores.userId, userIds))
    await db.delete(userBadges).where(inArray(userBadges.userId, userIds))
    await db.delete(userTotals).where(inArray(userTotals.userId, userIds))
  }
}

async function seedPredictions(
  userIdsByEmail: Record<string, string>,
  matchIdsByApiFootballId: Record<string, string>,
): Promise<void> {
  const matchKickoffByApiFootballId = Object.fromEntries(
    DEMO_MATCH_FIXTURES.map((fixture) => [fixture.apiFootballId, new Date(fixture.kickoffTime)]),
  )

  await db.insert(matchPredictions).values(
    DEMO_PREDICTIONS.map((prediction) => {
      const kickoffTime = matchKickoffByApiFootballId[prediction.matchApiFootballId]
      if (!kickoffTime) {
        throw new Error(`Unknown kickoff time for match ${prediction.matchApiFootballId}`)
      }

      return {
        userId: requireRecordValue(userIdsByEmail, prediction.userEmail, 'user id'),
        matchId: requireRecordValue(
          matchIdsByApiFootballId,
          prediction.matchApiFootballId,
          'match id',
        ),
        predictedHome: prediction.predictedHome,
        predictedAway: prediction.predictedAway,
        submittedAt: new Date(kickoffTime.getTime() - 6 * 60 * 60 * 1000),
      }
    }),
  )
}

async function seedSocialOddsSnapshots(matchIdsByApiFootballId: Record<string, string>): Promise<void> {
  const snapshotFixtures = DEMO_MATCH_FIXTURES.filter((fixture) =>
    ['LOCKED', 'LIVE', 'FINISHED'].includes(fixture.status),
  )

  for (const fixture of snapshotFixtures) {
    await createOrUpdateSocialOddsSnapshot(
      requireRecordValue(matchIdsByApiFootballId, fixture.apiFootballId, 'match id'),
      new Date(new Date(fixture.kickoffTime).getTime() - 15 * 60 * 1000),
    )
  }
}

async function seedMatchResultsAndScores(
  userIdsByEmail: Record<string, string>,
  matchIdsByApiFootballId: Record<string, string>,
): Promise<void> {
  const finishedFixtures = DEMO_MATCH_FIXTURES.filter((fixture) => fixture.status === 'FINISHED')
  const resultIdsByMatchId: Record<string, string> = {}
  const finishedMatchIds = finishedFixtures.map((fixture) =>
    requireRecordValue(matchIdsByApiFootballId, fixture.apiFootballId, 'match id'),
  )

  for (const fixture of finishedFixtures) {
    const matchId = requireRecordValue(matchIdsByApiFootballId, fixture.apiFootballId, 'match id')
    const [resultRow] = await db
      .insert(matchResults)
      .values({
        matchId,
        homeScore: fixture.homeScore ?? 0,
        awayScore: fixture.awayScore ?? 0,
        status: 'CONFIRMED',
        confirmedAt: new Date(new Date(fixture.kickoffTime).getTime() + 2 * 60 * 60 * 1000),
        source: 'demo-seed',
        createdAt: new Date(new Date(fixture.kickoffTime).getTime() + 2 * 60 * 60 * 1000),
      })
      .returning({ id: matchResults.id })

    if (!resultRow?.id) {
      throw new Error(`Unable to insert result for match ${fixture.apiFootballId}`)
    }

    resultIdsByMatchId[matchId] = resultRow.id
  }

  const finishedPredictions = await db
    .select()
    .from(matchPredictions)
    .where(inArray(matchPredictions.matchId, finishedMatchIds))

  if (finishedPredictions.length === 0) {
    return
  }

  await db.insert(matchScores).values(
    finishedPredictions.map((prediction) => {
      const resultFixture = finishedFixtures.find(
        (item) =>
          requireRecordValue(matchIdsByApiFootballId, item.apiFootballId, 'match id') === prediction.matchId,
      )

      if (!resultFixture) {
        throw new Error(`No finished fixture found for match ${prediction.matchId}`)
      }

      const scoring = scoreMatchPrediction(
        {
          predictedHome: prediction.predictedHome,
          predictedAway: prediction.predictedAway,
        },
        {
          homeScore: resultFixture.homeScore ?? 0,
          awayScore: resultFixture.awayScore ?? 0,
        },
      )

      const matchResultId = requireRecordValue(resultIdsByMatchId, prediction.matchId, 'match result id')
      return {
        userId: prediction.userId,
        matchId: prediction.matchId,
        predictionId: prediction.id,
        matchResultId,
        tier: scoring.tier,
        points: scoring.points,
        isSuperseded: false,
        calculatedAt: new Date(new Date(resultFixture.kickoffTime).getTime() + 2 * 60 * 60 * 1000),
      }
    }),
  )

  const uniqueUserIds = [...new Set(Object.values(userIdsByEmail))]
  for (const userId of uniqueUserIds) {
    await recomputeUserTotal(userId)
  }
}

async function seedOutrights(userIdsByEmail: Record<string, string>): Promise<void> {
  const [marketRows, optionRows] = await Promise.all([
    db.select().from(outrightMarkets),
    db.select().from(outrightOptions),
  ])

  const marketIdByCode: Record<string, string> = {}
  const pointValueByCode: Record<string, number> = {}
  const optionIdsByMarketCodeAndLabel: Record<string, Record<string, string>> = {}

  for (const market of marketRows) {
    marketIdByCode[market.code] = market.id
    pointValueByCode[market.code] = market.pointValue
    optionIdsByMarketCodeAndLabel[market.code] = {}
  }

  for (const option of optionRows) {
    const market = marketRows.find((row) => row.id === option.marketId)
    if (!market) {
      continue
    }

    optionIdsByMarketCodeAndLabel[market.code]![option.label] = option.id
  }

  await db.insert(outrightPredictions).values(
    DEMO_OUTRIGHT_PREDICTIONS.flatMap((prediction) => {
      const marketId = requireRecordValue(marketIdByCode, prediction.marketCode, 'market id')
      const userId = requireRecordValue(userIdsByEmail, prediction.userEmail, 'user id')

      return prediction.optionLabels.map((label) => ({
        userId,
        marketId,
        optionId: requireNestedRecordValue(
          optionIdsByMarketCodeAndLabel,
          prediction.marketCode,
          label,
          'outright option',
        ),
        submittedAt: new Date(Date.UTC(2026, 4, 2, 12, 0, 0)),
      }))
    }),
  )

  for (const marketFixture of DEMO_OUTRIGHT_MARKETS) {
    const marketId = requireRecordValue(marketIdByCode, marketFixture.marketCode, 'market id')
    await db.update(outrightMarkets).set({ status: marketFixture.status }).where(eq(outrightMarkets.id, marketId))

    if (marketFixture.status !== 'RESOLVED') {
      continue
    }

    const resultLabels = marketFixture.resultLabels ?? []
    await db.insert(outrightMarketResults).values(
      resultLabels.map((label) => ({
        marketId,
        optionId: requireNestedRecordValue(
          optionIdsByMarketCodeAndLabel,
          marketFixture.marketCode,
          label,
          'outright option',
        ),
        notes: 'demo-seed',
        resolvedAt: new Date(Date.UTC(2026, 4, 3, 21, 0, 0)),
      })),
    )
  }

  const predictionRows = await db
    .select()
    .from(outrightPredictions)
    .where(inArray(outrightPredictions.userId, Object.values(userIdsByEmail)))

  for (const marketFixture of DEMO_OUTRIGHT_MARKETS.filter((market) => market.status === 'RESOLVED')) {
    const marketId = requireRecordValue(marketIdByCode, marketFixture.marketCode, 'market id')
    const resolvedOptionIds = (marketFixture.resultLabels ?? []).map((label) =>
      requireNestedRecordValue(
        optionIdsByMarketCodeAndLabel,
        marketFixture.marketCode,
        label,
        'outright option',
      ),
    )

    for (const user of DEMO_USERS) {
      const userId = requireRecordValue(userIdsByEmail, user.email, 'user id')
      const predictedOptionIds = predictionRows
        .filter((prediction) => prediction.userId === userId && prediction.marketId === marketId)
        .map((prediction) => prediction.optionId)

      const points = calculateOutrightPoints({
        marketCode: marketFixture.marketCode as OutrightMarketCode,
        pointValue: requireRecordValue(pointValueByCode, marketFixture.marketCode, 'point value'),
        predictedOptionIds,
        resolvedOptionIds,
      })

      await db.insert(outrightScores).values({
        userId,
        marketId,
        points,
        calculatedAt: new Date(Date.UTC(2026, 4, 3, 21, 5, 0)),
      })
    }
  }
}

async function seedBadges(
  userIdsByEmail: Record<string, string>,
  matchIdsByApiFootballId: Record<string, string>,
): Promise<void> {
  for (const badge of DEMO_BADGES) {
    await db
      .insert(userBadges)
      .values({
        userId: requireRecordValue(userIdsByEmail, badge.userEmail, 'user id'),
        badgeType: badge.badgeType,
        awardedAt: new Date(Date.UTC(2026, 4, 4, 9, 0, 0)),
        triggerMatchId: badge.triggerMatchApiFootballId
          ? requireRecordValue(matchIdsByApiFootballId, badge.triggerMatchApiFootballId, 'match id')
          : null,
        zebraCount: badge.zebraCount ?? 1,
      })
      .onConflictDoUpdate({
        target: [userBadges.userId, userBadges.badgeType],
        set: {
          awardedAt: new Date(Date.UTC(2026, 4, 4, 9, 0, 0)),
          triggerMatchId: badge.triggerMatchApiFootballId
            ? requireRecordValue(matchIdsByApiFootballId, badge.triggerMatchApiFootballId, 'match id')
            : null,
          zebraCount: badge.zebraCount ?? 1,
        },
      })
  }
}

async function seedMuralPosts(
  userIdsByEmail: Record<string, string>,
  matchIdsByApiFootballId: Record<string, string>,
  leagueIdsByKey: Record<string, string>,
): Promise<void> {
  for (const post of DEMO_LEAGUE_POSTS) {
    const fixture = DEMO_MATCH_FIXTURES.find((item) => item.apiFootballId === post.matchApiFootballId)
    if (!fixture) {
      throw new Error(`Unknown match fixture for mural post ${post.matchApiFootballId}`)
    }

    const kickoffTime = new Date(fixture.kickoffTime)
    await db.insert(muralPosts).values({
      leagueId: requireRecordValue(leagueIdsByKey, post.leagueKey, 'league id'),
      matchId: requireRecordValue(matchIdsByApiFootballId, post.matchApiFootballId, 'match id'),
      userId: requireRecordValue(userIdsByEmail, post.userEmail, 'user id'),
      content: post.content,
      isHidden: false,
      createdAt: new Date(kickoffTime.getTime() + post.minutesAfterKickoff * 60 * 1000),
    })
  }
}

async function recomputeTotals(userIdsByEmail: Record<string, string>): Promise<void> {
  for (const userId of Object.values(userIdsByEmail)) {
    await recomputeUserTotal(userId)
  }
}

function printSummary(
  userIdsByEmail: Record<string, string>,
  matchIdsByApiFootballId: Record<string, string>,
  leagueIdsByKey: Record<string, string>,
): void {
  const matchesByStatus = groupByStatus(matchIdsByApiFootballId)

  console.info('[DemoSeed] Ready')
  console.info('[DemoSeed] Password for every seeded user: durogolpe123')

  console.info('[DemoSeed] Accounts:')
  for (const user of DEMO_USERS) {
    console.info(
      `  - ${user.displayName} <${user.email}> (${requireRecordValue(userIdsByEmail, user.email, 'user id')})`,
    )
  }

  console.info('[DemoSeed] Leagues:')
  for (const leagueFixture of DEMO_LEAGUES) {
    console.info(
      `  - ${leagueFixture.name} [${leagueFixture.inviteCode}] (${requireRecordValue(
        leagueIdsByKey,
        leagueFixture.key,
        'league id',
      )})`,
    )
  }

  console.info('[DemoSeed] Matches by status:')
  for (const status of ['SCHEDULED', 'LOCKED', 'LIVE', 'FINISHED']) {
    const ids = matchesByStatus[status] ?? []
    console.info(`  - ${status}: ${ids.join(', ')}`)
  }
}

async function main(): Promise<void> {
  const userIdsByEmail = await upsertDemoUsers()
  const teamIdsByKey = await upsertTeams(DEMO_TEAMS)
  await seedCatalogs({ resetOutrights: true })
  const matchIdsByApiFootballId = await upsertMatches(buildDemoMatches(), teamIdsByKey)
  let leagueIdsByKey = await upsertDemoLeagues(userIdsByEmail)

  const demoMatchIds = Object.values(matchIdsByApiFootballId)
  const demoUserIds = Object.values(userIdsByEmail)
  const demoLeagueIds = Object.values(leagueIdsByKey)

  await clearDemoState(demoMatchIds, demoUserIds, demoLeagueIds)
  leagueIdsByKey = await upsertDemoLeagues(userIdsByEmail)
  await seedPredictions(userIdsByEmail, matchIdsByApiFootballId)
  await seedSocialOddsSnapshots(matchIdsByApiFootballId)
  await seedMatchResultsAndScores(userIdsByEmail, matchIdsByApiFootballId)
  await seedOutrights(userIdsByEmail)
  await seedBadges(userIdsByEmail, matchIdsByApiFootballId)
  await seedMuralPosts(userIdsByEmail, matchIdsByApiFootballId, leagueIdsByKey)
  await recomputeTotals(userIdsByEmail)
  printSummary(userIdsByEmail, matchIdsByApiFootballId, leagueIdsByKey)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
