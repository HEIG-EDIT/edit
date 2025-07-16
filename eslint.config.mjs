import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: ["frontend/src", "backend"],
      },
    },
    ignorePatterns: ["**/.next/", "**/node_modules/"],
  }),
  ...tseslint.config(eslint.configs.recommended, tseslint.configs.recommended),
];

export default eslintConfig;
