import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Client } from 'pg'

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

function timestampForPath(value = new Date()) {
  return value.toISOString().replaceAll(':', '').replaceAll('.', '-')
}

function getArgValue(name) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`))
  if (inline) return inline.slice(name.length + 1)

  const index = process.argv.indexOf(name)
  if (index !== -1) return process.argv[index + 1]

  return undefined
}

async function loadConnectionString() {
  if (process.env.NEON_DATABASE_URL) {
    return process.env.NEON_DATABASE_URL
  }

  const envPath = getArgValue('--env') ?? 'backend/.env'
  const raw = await readFile(resolve(envPath), 'utf8')
  const env = parseDotEnv(raw)
  const connectionString = env.NEON_DATABASE_URL || env.DATABASE_MIGRATION_URL || env.DATABASE_URL

  if (!connectionString) {
    throw new Error(`NEON_DATABASE_URL, DATABASE_URL, or DATABASE_MIGRATION_URL is required in ${envPath}`)
  }

  return connectionString
}

async function getPublicTables(client) {
  const result = await client.query(`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = 'public'
    order by tablename
  `)

  return result.rows.map((row) => row.tablename)
}

async function exportTables(client) {
  const tables = {}
  const tableNames = await getPublicTables(client)

  for (const tableName of tableNames) {
    const result = await client.query(`select * from public.${quoteIdentifier(tableName)}`)
    tables[tableName] = {
      rowCount: result.rowCount,
      rows: result.rows,
    }
    console.log(`${tableName}: ${result.rowCount} rows`)
  }

  return tables
}

async function exportTableFiles(client, outputDir, exportedAt) {
  const manifest = {
    exportedAt: exportedAt.toISOString(),
    source: 'neon-emergency-export',
    format: 'table-files',
    tables: {},
  }
  const tableNames = await getPublicTables(client)

  await mkdir(outputDir, { recursive: true })

  for (const tableName of tableNames) {
    const result = await client.query(`select * from public.${quoteIdentifier(tableName)}`)
    const tableFile = `${tableName}.json`
    await writeFile(
      resolve(outputDir, tableFile),
      `${JSON.stringify({ tableName, rowCount: result.rowCount, rows: result.rows }, null, 2)}\n`,
      'utf8',
    )
    manifest.tables[tableName] = { rowCount: result.rowCount, file: tableFile }
    await writeFile(resolve(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    console.log(`${tableName}: ${result.rowCount} rows`)
  }

  return manifest
}

async function main() {
  const probeOnly = process.argv.includes('--probe')
  const tableFiles = process.argv.includes('--table-files')
  const connectionString = await loadConnectionString()
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000, statement_timeout: 120000 })

  await client.connect()

  try {
    const probe = await client.query('select current_database() as database, now() as exported_at')
    console.log(`Connected to ${probe.rows[0].database}`)

    if (probeOnly) {
      return
    }

    const exportedAt = new Date()
    await mkdir(resolve('backups'), { recursive: true })

    if (tableFiles) {
      const outputDir = resolve('backups', `neon-emergency-${timestampForPath(exportedAt)}`)
      await exportTableFiles(client, outputDir, exportedAt)
      console.log(`Wrote ${outputDir}`)
      return
    }

    const tables = await exportTables(client)
    const backup = {
      exportedAt: exportedAt.toISOString(),
      source: 'neon-emergency-export',
      tables,
    }

    const outputPath = resolve('backups', `neon-emergency-${timestampForPath(exportedAt)}.json`)
    await writeFile(outputPath, `${JSON.stringify(backup, null, 2)}\n`, 'utf8')
    console.log(`Wrote ${outputPath}`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error.code || error.name || 'ERROR')
  console.error(error.message)
  process.exit(1)
})
