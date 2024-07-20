import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: 'verbose',
    maxConcurrency: 50,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/site/**', '.eleventy.js', 'eslint.config.mjs', 'vitest.config.ts', '.yarn/**'],
    },
    setupFiles: ['tests/test-setup.ts'],
    testTimeout: 30_000,
  },
});
