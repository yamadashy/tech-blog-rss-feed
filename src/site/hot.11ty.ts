import constants from '../common/constants';
import { renderFeedItem } from './_includes/components/feed-item';
import { renderNav } from './_includes/components/nav';
import { indexScript } from './_includes/components/scripts';
import { type EleventyPage, type FeedJsonItem, SITE_PAGE_DATE } from './_includes/components/types';

interface HotData {
  page: EleventyPage;
  feedItemsHot: FeedJsonItem[];
}

export const data = {
  layout: 'layouts/main.11ty.ts',
  date: SITE_PAGE_DATE,
  eleventyComputed: {
    // エスケープはレイアウト側（main.11ty.ts）で行うため、ここでは生の文字列を渡す
    pageTitle: () => `人気フィード｜${constants.siteTitle}`,
    lastUpdated: (data: { lastModifiedBlogsDate: string }) => data.lastModifiedBlogsDate,
  },
};

export async function render(data: HotData): Promise<string> {
  const { page, feedItemsHot } = data;

  const items = await Promise.all(
    feedItemsHot.map((feedItem, index) => renderFeedItem(feedItem, page, index < 4 ? 'eager' : 'lazy')),
  );

  return `${renderNav(page)}

<section class="ui-section-content ui-section-feed">
    <div class="ui-layout-container">
        <h2 class='ui-typography-heading'>直近1週間の人気フィード</h2>
        <p class='ui-text-note'>はてなブックマーク数を元に新着優先で並べ替え</p>

        <div class="ui-section-content--feature ui-layout-grid ui-layout-grid-3 ui-container-feed ui-container-feed--hot">
            ${items.join('\n')}
        </div>
    </div>
</section>

<script>
    ${indexScript}
</script>`;
}
