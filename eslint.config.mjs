/**
 * eslint.config.mjs
 * 
 * Configuration ESLint
 * 
 * Rôle:
 * - Configure les règles de linting pour le code TypeScript/JavaScript
 * - Étend les configurations Next.js pour Core Web Vitals et TypeScript
 * - Ignore les fichiers/dossiers non pertinents pour l'analyse
 * 
 * Configuration:
 * - Applique les règles Next.js Web Vitals et TypeScript
 * - Ignore: .next/, out/, build/, next-env.d.ts
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
