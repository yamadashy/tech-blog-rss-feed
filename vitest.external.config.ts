import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: 'verbose',
    maxConcurrency: 50,
    include: ['tests/external/**/*.test.ts'],
    setupFiles: ['tests/test-setup.ts'],
    testTimeout: 5 * 60 * 1000,
  },
});
