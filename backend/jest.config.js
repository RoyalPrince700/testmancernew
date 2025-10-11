export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'models/**/*.js',
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!node_modules/**'
  ],
  setupFilesAfterEnv: [],
  testTimeout: 10000,
  // Use a test database
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};
