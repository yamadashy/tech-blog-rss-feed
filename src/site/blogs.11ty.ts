import constants from '../common/constants';
import { imageThumbnailShortcode } from '../common/eleventy-utils';
import { escapeHtml, truncateNunjucks } from './_includes/components/html-utils';
import { renderNav } from './_includes/components/nav';
import { type EleventyPage, SITE_PAGE_DATE, type SiteBlogFeed } from './_includes/components/types';

interface BlogsData {
  page: EleventyPage;
  blogFeeds: SiteBlogFeed[];
}

export const data = {
  layout: 'layouts/main.11ty.ts',
  date: SITE_PAGE_DATE,
  eleventyComputed: {
    // エスケープはレイアウト側（main.11ty.ts）で行うため、ここでは生の文字列を渡す
    pageTitle: () => `ブログ一覧｜${constants.siteTitle}`,
    lastUpdated: (data: { lastModifiedBlogsDate: string }) => data.lastModifiedBlogsDate,
  },
};

export async function render(data: BlogsData): Promise<string> {
  const { page, blogFeeds } = data;

  const blogs = await Promise.all(
    blogFeeds.map(async (blogFeed) => {
      // blog-feeds.json の ogImageUrl は常に string（null にはならない）ため、
      // Nunjucks の `{% if blogFeed.ogImageUrl !== null %}` は常に true。
      // 空文字のときは shortcode 側が代替画像を返す。
      const ogImage = await imageThumbnailShortcode(blogFeed.ogImageUrl, 'ブログのアイキャッチ画像', '../');

      const description = blogFeed.ogDescription
        ? `<div class='ui-blog__description'>${escapeHtml(truncateNunjucks(blogFeed.ogDescription, 200))}</div>`
        : '';

      const date = blogFeed.lastUpdated
        ? `<div class='ui-blog__date' title='${escapeHtml(blogFeed.lastUpdatedForHuman)}'>${escapeHtml(blogFeed.diffLastUpdatedDateForHuman)}</div>`
        : `<div class='ui-blog__date' title='更新日時なし'>-</div>`;

      return `<div class='ui-blog'>
                    <a class='ui-blog__og-image' href='./${escapeHtml(blogFeed.linkMd5Hash)}/'>
                        ${ogImage}
                    </a>
                    <div class='ui-blog__content'>
                        <a class='ui-blog__title' href='./${escapeHtml(blogFeed.linkMd5Hash)}/'>${escapeHtml(blogFeed.title)}</a>
                        <a class='ui-blog__link' href='${escapeHtml(blogFeed.link)}'>${escapeHtml(blogFeed.link)}</a>
                        ${description}
                        ${date}
                    </div>
                </div>`;
    }),
  );

  return `${renderNav(page)}

<section class="ui-section-content ui-section-blog">
    <div class="ui-layout-container">
        <h2 class='ui-typography-heading'>ブログ一覧<small>（更新順）</small></h2>
        <div class="ui-section-content--feature ui-layout-grid ui-layout-grid-3 ui-container-blog">
            ${blogs.join('\n')}
        </div>
    </div>
</section>`;
}
