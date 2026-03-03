import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        // required for rules that need type information
        project: "./tsconfig.json",
      },
    },
    rules: {
      // catch un-awaited promises like cookies() and other async calls
      "@typescript-eslint/no-floating-promises": "error",
      // ensure we don't await non-Promise values
      "@typescript-eslint/await-thenable": "error",
      // explicit any is very common in tests and generated code; warn only
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // vendor package tests and config artifacts that tsc/lint shouldn't lint
    "lib/erecht24-package/**",
    "eslint.config.mjs",
    "postcss.config.mjs",
  ]),
]);

export default eslintConfig;
