import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const backendEnvPath = path.join(repoRoot, 'backend', '.env')

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    return
  }

  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  })
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function printOutput(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout)
  }

  if (result.stderr) {
    process.stderr.write(result.stderr)
  }
}

function assertSpawnSucceeded(result, label) {
  if (!result.error) {
    return
  }

  const message = result.error instanceof Error ? result.error.message : String(result.error)
  throw new Error(`${label} could not be started: ${message}`)
}

function extractSmokeMatchId(output) {
  const tagged = output.match(/SMOKE_MATCH_ID=([0-9a-f-]+)/i)
  if (tagged?.[1]) {
    return tagged[1]
  }

  const legacy = output.match(/Match ID:\s*([0-9a-f-]+)/i)
  return legacy?.[1] ?? null
}

async function assertBackendReachable(baseUrl) {
  try {
    await fetch(`${baseUrl}/api/v1/matches`, { method: 'GET' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Launch smoke requires the backend HTTP server to be running at ${baseUrl}. Start it with "npm run dev:backend" before rerunning the smoke gate. Original error: ${message}`,
    )
  }
}

async function main() {
  loadEnvFile(backendEnvPath)

  const webhookSecret = process.env.WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    throw new Error(
      'Launch smoke requires WEBHOOK_SECRET in the current environment or backend/.env before Playwright can run the live webhook scenario.',
    )
  }

  const npmCommand = getNpmCommand()
  const seedResult = runCommand(npmCommand, ['--workspace=backend', 'run', 'seed:smoke'], {
    env: process.env,
  })
  assertSpawnSucceeded(seedResult, 'seed:smoke')
  printOutput(seedResult)

  if (seedResult.status !== 0) {
    process.exit(seedResult.status ?? 1)
  }

  const combinedSeedOutput = `${seedResult.stdout ?? ''}\n${seedResult.stderr ?? ''}`
  const matchId = extractSmokeMatchId(combinedSeedOutput)
  if (!matchId) {
    throw new Error(
      'Launch smoke could not resolve the seeded smoke match UUID from seed:smoke output. Expected an SMOKE_MATCH_ID=... line in the seed logs.',
    )
  }

  const backendBaseUrl = process.env.BASE_URL ?? 'http://localhost:3001'
  await assertBackendReachable(backendBaseUrl)

  const playwrightArgs = [
    path.join(repoRoot, 'node_modules', '@playwright', 'test', 'cli.js'),
    'test',
    'frontend/tests/e2e/launch-smoke.spec.ts',
    'frontend/tests/e2e/live-score.spec.ts',
    '--project=chromium',
    '--workers=1',
  ]

  const testResult = spawnSync(process.execPath, playwrightArgs, {
    cwd: repoRoot,
    env: {
      ...process.env,
      E2E_MATCH_ID: matchId,
    },
    stdio: 'inherit',
  })
  assertSpawnSucceeded(testResult, 'Playwright launch smoke')

  process.exit(testResult.status ?? 1)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
