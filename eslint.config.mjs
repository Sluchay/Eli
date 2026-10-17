import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/**
 * ESLint для проекта.
 *
 * core-web-vitals — правила Next.js и React, включая проверки производительности;
 * typescript — правила typescript-eslint. Игнорируем сборку, зависимости и данные:
 * там нет исходников, а сканировать гигабайты кэша бессмысленно.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    '.pnpm-store/**',
    'data/**',
    '.shots/**',
    'next-env.d.ts',
    'tsconfig.tsbuildinfo',
  ]),
])
