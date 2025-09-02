import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",

  // 👇 add Docker setup/teardown here
  globalSetup: "<rootDir>/../jest.global-setup.ts",
  globalTeardown: "<rootDir>/../jest.global-teardown.ts",

  // avoid parallel DB test conflicts
  maxWorkers: 1,
};

export default config;
