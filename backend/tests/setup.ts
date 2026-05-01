import { afterAll, beforeAll } from 'vitest'

// Testcontainers helper — imported by individual integration test files as needed.
// Provides shared setup/teardown patterns for PostgreSQL + Redis containers.

export async function withPostgres(
  fn: (connectionString: string) => Promise<void>,
): Promise<void> {
  const { PostgreSqlContainer } = await import('@testcontainers/postgresql')
  const container = await new PostgreSqlContainer('postgres:16-alpine').start()
  const connectionString = container.getConnectionUri()
  try {
    await fn(connectionString)
  } finally {
    await container.stop()
  }
}

export async function withRedis(fn: (url: string) => Promise<void>): Promise<void> {
  const { GenericContainer } = await import('testcontainers')
  const container = await new GenericContainer('redis:7-alpine').withExposedPorts(6379).start()
  const url = `redis://${container.getHost()}:${container.getMappedPort(6379)}`
  try {
    await fn(url)
  } finally {
    await container.stop()
  }
}
