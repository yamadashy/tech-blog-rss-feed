import { type SitemapData, renderSitemap } from './_includes/components/sitemap';

export const data = {
  permalink: '/sitemap.xml',
  eleventyExcludeFromCollections: true,
};

export function render(data: SitemapData): string {
  return renderSitemap(data);
}
