import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.security.setup.ts'],
    include: [
      'backend/tests/integration/mural.test.ts',
      'backend/tests/integration/score-routes.test.ts',
      'backend/tests/integration/badge-routes.test.ts',
      'backend/tests/integration/ws-security.test.ts',
    ],
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30000,
    hookTimeout: 60000,
  },
})
