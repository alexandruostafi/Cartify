// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Generous timeout for bcrypt hashing in both suites
  testTimeout: 20000,

  // Coverage collected from backend source only
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/seed.js',
    '!backend/server.js',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',

  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      testEnvironment: 'node',
      // Integration tests share one server per file — run files serially
      // to avoid port / db contention between workers.
      runner: 'jest-runner',
      maxWorkers: 1,
    },
  ],
};
