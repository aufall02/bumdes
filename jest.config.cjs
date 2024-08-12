/** @type {import('jest').Config} */
const config = {
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(strip-ansi)/)'
    ],
    testEnvironment: 'node',
};

module.exports = config;
