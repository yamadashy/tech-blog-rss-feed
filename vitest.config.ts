import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: 'verbose',
    maxConcurrency: 50,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        // テンプレート・スクリプト・スタイルはカバレッジ対象外だが、
        // ロジックを持つファイル（html-utils / _data の lib）は対象に含める
        'src/site/**/*.11ty.ts',
        'src/site/_data/*.js',
        'src/site/_includes/components/feed-item.ts',
        'src/site/_includes/components/nav.ts',
        'src/site/_includes/components/scripts.ts',
        'src/site/_includes/components/sitemap.ts',
        'src/site/_includes/components/top-section.ts',
        'src/site/_includes/components/types.ts',
        '.eleventy.js',
        'eslint.config.mjs',
        'vitest.config.ts',
      ],
    },
    setupFiles: ['tests/test-setup.ts'],
    testTimeout: 5 * 60 * 1000,
  },
});
