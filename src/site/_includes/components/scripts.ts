import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * `<script>` にインライン展開するクライアントスクリプト。
 * Nunjucks の `{% include "scripts/index.ts" %}` 相当（ファイル内容をそのまま埋め込む）。
 */
export const indexScript = fs.readFileSync(fileURLToPath(new URL('../scripts/index.ts', import.meta.url)), 'utf-8');

/**
 * Client script that recomputes relative dates ("◯分前") against the viewer's
 * current time. Included by the shared layout (layouts/main.11ty.ts) so it
 * applies to every page.
 */
export const relativeTimeScript = fs.readFileSync(
  fileURLToPath(new URL('../scripts/relative-time.ts', import.meta.url)),
  'utf-8',
);

/**
 * Blocking script inlined at the top of <head> that restores the theme saved in
 * localStorage before the stylesheet is applied, avoiding a flash of the wrong
 * theme. Included by the shared layout (layouts/main.11ty.ts).
 */
export const themeInitScript = fs.readFileSync(
  fileURLToPath(new URL('../scripts/theme-init.ts', import.meta.url)),
  'utf-8',
);

/**
 * Client script backing the dark mode toggle switch in the header. Included by
 * the shared layout (layouts/main.11ty.ts) so it applies to every page.
 */
export const themeToggleScript = fs.readFileSync(
  fileURLToPath(new URL('../scripts/theme-toggle.ts', import.meta.url)),
  'utf-8',
);
