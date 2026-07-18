/**
 * Nunjucks 互換の HTML ユーティリティ。
 *
 * `.11ty.ts` テンプレートでは Nunjucks の autoescape / filter が使えないため、
 * Nunjucks と同じ出力になるようにヘルパーを実装している。
 */

// Nunjucks の `lib.escape`（node_modules/nunjucks/src/lib.js）と完全に一致させる。
// 正規表現・置換マップ（バックスラッシュを含む）まで同一にすること。
const NUNJUCKS_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
  '\\': '&#92;',
};

/**
 * Nunjucks の autoescape（`{{ value }}`）と同じ挙動で HTML エスケープする。
 *
 * Nunjucks の `runtime.suppressValue` に合わせて、
 * `undefined` / `null` は空文字にしてから `.toString()` 相当でエスケープする。
 */
export const escapeHtml = (value: unknown): string => {
  const stringValue = value === undefined || value === null ? '' : String(value);
  return stringValue.replace(/[&"'<>\\]/g, (char) => NUNJUCKS_ESCAPE_MAP[char]);
};

/**
 * Nunjucks の `truncate(length, true, "...")` フィルタと同じ挙動。
 * （killwords=true 固定。node_modules/nunjucks/src/filters.js の truncate 参照）
 *
 * - 入力長が length 以下ならそのまま返す
 * - それ以外は substring(0, length) して末尾に end を付与する
 *
 * Nunjucks では truncate 後に autoescape されるため、
 * 呼び出し側で `escapeHtml(truncateNunjucks(...))` の順で使うこと。
 */
export const truncateNunjucks = (input: string | null | undefined, length: number, end = '...'): string => {
  const normalized = input === undefined || input === null ? '' : String(input);
  if (normalized.length <= length) {
    return normalized;
  }
  return normalized.substring(0, length) + end;
};
