// /site.xml を生成する。/sitemap.xml を生成する sitemap.11ty.ts と同一内容のため、
// どちらか一方を変更する場合は両方を同期させること。
import { type SitemapData, renderSitemap } from './_includes/components/sitemap';

export const data = {
  permalink: '/site.xml',
  eleventyExcludeFromCollections: true,
};

export function render(data: SitemapData): string {
  return renderSitemap(data);
}
