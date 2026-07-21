import { imageIconShortcode, imageThumbnailShortcode, relativeUrlFilter } from '../../../common/eleventy-utils';
import { escapeHtml, truncateNunjucks } from './html-utils';
import type { EleventyPage, FeedJsonItem } from './types';

/**
 * partials/feed-item.njk 相当のフィードアイテム。
 * 画像ショートコードが非同期のため async。
 */
export const renderFeedItem = async (
  feedItem: FeedJsonItem,
  page: EleventyPage,
  imageLoading: string,
): Promise<string> => {
  const rawRelativeUrl = relativeUrlFilter(page.url);
  const relativeUrl = escapeHtml(rawRelativeUrl);

  const ogImage = feedItem.image
    ? await imageThumbnailShortcode(feedItem.image.url, '記事のアイキャッチ画像', rawRelativeUrl, imageLoading)
    : `<img src='${relativeUrl}images/alternate-feed-image.png' loading="${escapeHtml(imageLoading)}" alt='記事のアイキャッチ画像' width='256' height='256'>`;

  const hatenaCount =
    feedItem._custom.hatenaCount > 0
      ? `<div class='ui-feed-item__hatena-count' title='はてなブックマーク数'>
                <img src='${relativeUrl}images/hatenabookmark-icon.png' alt='はてなブックマークアイコン' loading="${escapeHtml(imageLoading)}" width='16' height='16'>
                <span>${escapeHtml(feedItem._custom.hatenaCount)}</span>
            </div>`
      : '';

  const favicon = feedItem._custom.favicon
    ? await imageIconShortcode(feedItem._custom.favicon, 'ブログのファビコン', rawRelativeUrl, imageLoading)
    : '';

  const summary = feedItem.content_html
    ? `<div class='ui-feed-item__summary'>${escapeHtml(truncateNunjucks(feedItem.content_html, 500))}</div>`
    : '';

  // data-datetime lets scripts/relative-time.ts recompute the relative date on the client;
  // the build-time diffDateForHuman text remains as a no-JS fallback.
  const dateAttr = feedItem.date_published ? ` data-datetime='${escapeHtml(feedItem.date_published)}'` : '';

  return `<div class='ui-feed-item'>
    <a class='ui-feed-item__og-image' href='${escapeHtml(feedItem.url)}'>
        ${ogImage}
    </a>
    <div class='ui-feed-item__content'>
        <a class='ui-feed-item__title' href='${escapeHtml(feedItem.url)}'>${escapeHtml(feedItem._custom.originalTitle)}</a>
        ${hatenaCount}
        <a class='ui-feed-item__blog-title ui-feed-item__blog-title--link' href='${relativeUrl}blogs/${escapeHtml(feedItem._custom.blogLinkMd5Hash)}'>
          ${favicon}
          <span>${escapeHtml(feedItem._custom.blogTitle)}</span>
        </a>
        ${summary}
        <div class='ui-feed-item__date'${dateAttr} title='${escapeHtml(feedItem.pubDateForHuman)}'>${escapeHtml(feedItem.diffDateForHuman)}</div>
    </div>
</div>`;
};
