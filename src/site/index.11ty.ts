import constants from '../common/constants';
import { renderFeedItem } from './_includes/components/feed-item';
import { escapeHtml } from './_includes/components/html-utils';
import { renderNav } from './_includes/components/nav';
import { indexScript } from './_includes/components/scripts';
import { renderTopSection } from './_includes/components/top-section';
import { type EleventyPage, type FeedItemsChunks, SITE_PAGE_DATE } from './_includes/components/types';

interface IndexData {
  page: EleventyPage;
  feedItemsChunks: FeedItemsChunks;
  lastModifiedBlogsDate: string;
}

export const data = {
  layout: 'layouts/main.11ty.ts',
  date: SITE_PAGE_DATE,
  eleventyComputed: {
    // Nunjucks 版は front matter の eleventyComputed で一度エスケープされ、
    // さらに main.njk の `{{ pageTitle }}` で二重エスケープされていたため、それを再現する。
    pageTitle: () => escapeHtml(constants.siteTitle),
    lastUpdated: (data: { lastModifiedBlogsDate: string }) => data.lastModifiedBlogsDate,
  },
};

export async function render(data: IndexData): Promise<string> {
  const { page, feedItemsChunks } = data;

  const chunks: string[] = [];
  for (const [dateString, feedItems] of Object.entries(feedItemsChunks)) {
    const items = await Promise.all(
      feedItems.map((feedItem, index) => renderFeedItem(feedItem, page, index < 4 ? 'eager' : 'lazy')),
    );
    chunks.push(`<h3 class='ui-section-content__feed-date-heading'>${escapeHtml(dateString)}</h3>
            <div class="ui-section-content--feature ui-layout-grid ui-layout-grid-3 ui-container-feed">
                ${items.join('\n')}
            </div>`);
  }

  return `${renderTopSection(page)}

${renderNav(page)}

<section class="ui-section-content ui-section-feed">
    <div class="ui-layout-container">
        <h2 class='ui-typography-heading'>直近1週間の更新</h2>

        ${chunks.join('\n\n')}
    </div>
</section>

<script>
    ${indexScript}
</script>`;
}
