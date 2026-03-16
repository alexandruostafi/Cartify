// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  // Generous timeout for bcrypt hashing
  testTimeout: 15000,
  // Coverage collected from backend source only
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/seed.js',
    '!backend/server.js',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
};
