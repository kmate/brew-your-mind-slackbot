module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/test/**/*.test.ts"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/server.ts"
    ],
    coverageDirectory: "coverage",
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: "tsconfig.json"
        }]
    }
};
