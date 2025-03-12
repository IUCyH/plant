import { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
    moduleFileExtensions: ["ts", "js"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    testTimeout: 30000
};

export default config;
