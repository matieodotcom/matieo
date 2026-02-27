import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  setupFilesAfterFramework: ['./src/__tests__/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts', '!src/__tests__/**', '!src/server.ts', '!**/*.d.ts'],
  coverageThresholds: {
    global: { lines: 75, functions: 75, branches: 65, statements: 75 },
  },
}

export default config
