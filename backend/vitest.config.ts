import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/integration/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  projects: [
    {
      test: {
        name: 'unit',
        include: ['tests/unit/**/*.test.ts'],
        environment: 'node',
      },
    },
    {
      test: {
        name: 'integration',
        include: ['tests/integration/**/*.test.ts'],
        environment: 'node',
        testTimeout: 30000,
        hookTimeout: 60000,
        pool: 'forks',
        poolOptions: { forks: { singleFork: true } },
      },
    },
  ],
})
