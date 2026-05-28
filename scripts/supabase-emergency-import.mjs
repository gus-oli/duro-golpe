import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Client } from 'pg'

const TABLE_ORDER = [
  'users',
  'badges',
  'teams',
  'matches',
  'outright_markets',
  'outright_options',
  'leagues',
  'league_memberships',
  'match_predictions',
  'match_results',
  'match_scores',
  'mural_posts',
  'outright_predictions',
  'outright_market_results',
  'outright_scores',
  'password_reset_tokens',
  'user_badges',
  'user_totals',
]

function parseDotEnv(raw) {
  const env = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    env[key] = value
  }

  return env
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`
}

async function loadConnectionString() {
  const raw = await readFile(resolve('backend/.env'), 'utf8')
  const env = parseDotEnv(raw)
  const connectionString = env.DATABASE_MIGRATION_URL || env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL or DATABASE_MIGRATION_URL is required in backend/.env')
  }

  return connectionString
}

async function findLatestBackup() {
  const backupDir = resolve('backups')
  let files
  try {
    files = await readdir(backupDir)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error('No backups directory found. Run scripts/neon-emergency-export.mjs first.')
    }

    throw error
  }

  const candidates = files.filter((file) => /^neon-emergency-.+(\.json)?$/.test(file)).sort()

  if (candidates.length === 0) {
    throw new Error('No backups/neon-emergency-*.json file found')
  }

  return resolve(backupDir, candidates.at(-1))
}

async function loadBackup(backupPath) {
  const info = await stat(backupPath)

  if (info.isDirectory()) {
    const manifest = JSON.parse(await readFile(resolve(backupPath, 'manifest.json'), 'utf8'))
    const tables = {}

    for (const [tableName, tableInfo] of Object.entries(manifest.tables ?? {})) {
      const tableBackup = JSON.parse(await readFile(resolve(backupPath, tableInfo.file), 'utf8'))
      tables[tableName] = {
        rowCount: tableBackup.rowCount,
        rows: tableBackup.rows,
      }
    }

    return { ...manifest, tables }
  }

  return JSON.parse(await readFile(backupPath, 'utf8'))
}

async function getTargetRowCounts(client) {
  const counts = {}

  for (const tableName of TABLE_ORDER) {
    const result = await client.query(`select count(*)::int as count from public.${quoteIdentifier(tableName)}`)
    counts[tableName] = result.rows[0].count
  }

  return counts
}

async function insertRows(client, tableName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`${tableName}: 0 rows`)
    return
  }

  const columns = Object.keys(rows[0])
  const columnSql = columns.map(quoteIdentifier).join(', ')
  const valuesSql = rows
    .map((row, rowIndex) => {
      const placeholders = columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`)
      return `(${placeholders.join(', ')})`
    })
    .join(', ')

  const values = rows.flatMap((row) => columns.map((column) => row[column]))
  await client.query(`insert into public.${quoteIdentifier(tableName)} (${columnSql}) values ${valuesSql}`, values)
  console.log(`${tableName}: ${rows.length} rows`)
}

async function main() {
  const allowNonEmpty = process.argv.includes('--allow-non-empty')
  const requestedBackup = process.argv.find((arg) => arg.endsWith('.json') || arg.includes('neon-emergency-'))
  const backupPath = requestedBackup ? resolve(requestedBackup) : await findLatestBackup()
  const backup = await loadBackup(backupPath)

  if (!backup.tables) {
    throw new Error(`${backupPath} does not look like a neon-emergency export`)
  }

  const connectionString = await loadConnectionString()
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 })

  await client.connect()

  try {
    const counts = await getTargetRowCounts(client)
    const nonEmpty = Object.entries(counts).filter(([, count]) => count > 0)

    if (nonEmpty.length > 0 && !allowNonEmpty) {
      throw new Error(
        `Target Supabase database is not empty: ${nonEmpty
          .map(([tableName, count]) => `${tableName}=${count}`)
          .join(', ')}. Re-run with --allow-non-empty only if you know this is safe.`,
      )
    }

    await client.query('begin')

    for (const tableName of TABLE_ORDER) {
      await insertRows(client, tableName, backup.tables[tableName]?.rows ?? [])
    }

    await client.query('commit')
    console.log(`Imported ${backupPath}`)
  } catch (error) {
    await client.query('rollback').catch(() => undefined)
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error.code || error.name || 'ERROR')
  console.error(error.message)
  process.exit(1)
})
