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
