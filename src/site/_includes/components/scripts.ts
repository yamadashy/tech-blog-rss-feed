import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * `<script>` にインライン展開するクライアントスクリプト。
 * Nunjucks の `{% include "scripts/index.ts" %}` 相当（ファイル内容をそのまま埋め込む）。
 */
export const indexScript = fs.readFileSync(fileURLToPath(new URL('../scripts/index.ts', import.meta.url)), 'utf-8');
