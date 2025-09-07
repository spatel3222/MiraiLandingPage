module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'api/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    testTimeout: 10000
};