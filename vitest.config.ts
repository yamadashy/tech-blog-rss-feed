import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: 'verbose',
    maxConcurrency: 50,
    setupFiles: [
      'tests/test-setup.ts',
    ],
    testTimeout: 30_000,
  },
});
