import constants from '../common/constants';
import { imageThumbnailShortcode, relativeUrlFilter } from '../common/eleventy-utils';
import { escapeHtml, truncateNunjucks } from './_includes/components/html-utils';
import { renderNav } from './_includes/components/nav';
import { type EleventyPage, SITE_PAGE_DATE, type SiteBlogFeed } from './_includes/components/types';

interface BlogFeedData {
  page: EleventyPage;
  blogFeed: SiteBlogFeed;
}

export const data = {
  layout: 'layouts/main.11ty.ts',
  date: SITE_PAGE_DATE,
  pagination: {
    data: 'blogFeeds',
    size: 1,
    alias: 'blogFeed',
    addAllPagesToCollections: true,
  },
  permalink: (data: BlogFeedData) => `blogs/${data.blogFeed.linkMd5Hash}/`,
  eleventyComputed: {
    // エスケープはレイアウト側（main.11ty.ts）で行うため、ここでは生の文字列を渡す
    // title が null のフィードがあるため空文字にフォールバックする
    pageTitle: (data: BlogFeedData) => `${data.blogFeed.title ?? ''}のフィード｜${constants.siteTitle}`,
    lastUpdated: (data: BlogFeedData) => data.blogFeed.lastUpdatedIso ?? '',
  },
};

export async function render(data: BlogFeedData): Promise<string> {
  const { page, blogFeed } = data;
  const rawRelativeUrl = relativeUrlFilter(page.url);
  const relativeUrl = escapeHtml(rawRelativeUrl);

  const items = await Promise.all(
    blogFeed.items.map(async (feedItem) => {
      // blog-feeds.json の ogImageUrl は常に string（null にはならない）ため、
      // Nunjucks の `{% if feedItem.ogImageUrl !== null %}` は常に true。
      // 空文字のときは shortcode 側が代替画像を返す。
      const ogImage = await imageThumbnailShortcode(feedItem.ogImageUrl, '記事のアイキャッチ画像', rawRelativeUrl);

      const hatenaCount =
        feedItem.hatenaCount > 0
          ? `<div class='ui-feed-item__hatena-count' title='はてなブックマーク数'>
                                <img src='${relativeUrl}images/hatenabookmark-icon.png' alt='はてなブックマークアイコン' loading="lazy" width='96' height='96'>
                                <span>${escapeHtml(feedItem.hatenaCount)}</span>
                            </div>`
          : '';

      const summary = feedItem.content_html
        ? `<div class='ui-feed-item__summary'>${escapeHtml(truncateNunjucks(feedItem.content_html, 1000))}</div>`
        : '';

      return `<div class='ui-feed-item'>
                    <a class='ui-feed-item__og-image' href='${escapeHtml(feedItem.link)}'>
                        ${ogImage}
                    </a>
                    <div class='ui-feed-item__content'>
                        <a class='ui-feed-item__title' href='${escapeHtml(feedItem.link)}'>${escapeHtml(feedItem.title)}</a>
                        ${hatenaCount}
                        <div class='ui-feed-item__blog-title'>${escapeHtml(blogFeed.title)}</div>
                        ${summary}
                        <div class='ui-feed-item__date' title='${escapeHtml(feedItem.pubDateForHuman)}'>${escapeHtml(feedItem.diffDateForHuman)}</div>
                    </div>
                </div>`;
    }),
  );

  return `${renderNav(page)}

<section class="ui-section-content ui-section-feed">
    <div class="ui-layout-container">
        <h2 class='ui-typography-heading'>${escapeHtml(blogFeed.title)}</h2>
        <div class='ui-container-blog-summary'>
            <div class='ui-blog-summary'>
                <a class='ui-blog-summary__link' href='${escapeHtml(blogFeed.link)}'>${escapeHtml(blogFeed.link)}</a>
                <p class='ui-blog-summary__description'>${escapeHtml(blogFeed.ogDescription)}</p>
            </div>
        </div>

        <h3 class='ui-typography-heading'>フィード</h3>
        <div class="ui-section-content--feature ui-layout-grid ui-layout-grid-3 ui-container-feed ui-container-feed--no-image">
            ${items.join('\n')}
        </div>
    </div>
</section>`;
}
