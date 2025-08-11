import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: any = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)"],
};

export default createJestConfig(config);
