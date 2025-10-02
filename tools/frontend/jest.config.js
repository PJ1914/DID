const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './'
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/store/(.*)$': '<rootDir>/src/store/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/utils/(.*)$': '<rootDir>/src/utils/$1'
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}']
};

module.exports = createJestConfig(customJestConfig);
