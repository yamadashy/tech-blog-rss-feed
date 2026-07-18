import constants from '../../../common/constants';
import { escapeHtml } from './html-utils';

interface SitemapCollectionItem {
  url: string;
  data: {
    lastUpdated?: string;
  };
}

export interface SitemapData {
  collections: {
    all: SitemapCollectionItem[];
  };
}

/**
 * site.njk / sitemap.njk 相当の sitemap XML。
 *
 * この出力は HTML minify 対象外（.xml）のため、Nunjucks の出力と
 * 空白・改行まで完全一致させる必要がある。
 * Nunjucks（trimBlocks/lstripBlocks なし）の `{% for %}` は前後の改行を残すため、
 * 各 <url> ブロックの前に空行が入る点まで再現している。
 */
export const renderSitemap = (data: SitemapData): string => {
  const urls = data.collections.all
    .map(
      (page) =>
        `\n    <url>\n        <loc>${escapeHtml(constants.siteUrlStem)}${escapeHtml(page.url)}</loc>\n        <lastmod>${escapeHtml(page.data.lastUpdated)}</lastmod>\n    </url>\n`,
    )
    .join('');

  return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};
