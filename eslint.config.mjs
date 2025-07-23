import frontendConfig from "./frontend/eslint.config.mjs";
import backendConfig from "./backend/eslint.config.mjs";

export default [
  // Frontend config with specific file patterns
  ...frontendConfig.map((config) => ({
    ...config,
    files: config.files?.map((pattern) => `frontend/${pattern}`) || [
      "frontend/**/*",
    ],
  })),

  // Backend config with specific file patterns
  ...backendConfig.map((config) => ({
    ...config,
    files: config.files?.map((pattern) => `backend/${pattern}`) || [
      "backend/**/*",
    ],
  })),

  // Ignore patterns
  {
    ignores: ["node_modules/", "dist/", ".next/", "build/"],
  },
];
