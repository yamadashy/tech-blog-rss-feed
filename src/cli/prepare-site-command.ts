import { PromisePool } from '@supercharge/promise-pool';
import { to } from 'await-to-js';
import constants from '../common/constants';
import { imageThumbnailShortcode } from '../common/eleventy-utils';
import type { BlogFeed } from '../feed/feed-storer';
import { logger } from '../feed/logger';
// @ts-ignore
import blogFeeds from '../site/blog-feeds/blog-feeds.json' assert { type: 'json' };

const typedBlogFeeds: BlogFeed[] = blogFeeds as BlogFeed[];

/**
 * サイトの前準備処理。Eleventyの高速化のための処理なので実行しなくても問題はない
 */
(async () => {
  let ogImageUrls: string[] = [];

  for (const blogFeed of typedBlogFeeds) {
    ogImageUrls.push(blogFeed.ogImageUrl);
    for (const item of blogFeed.items) {
      ogImageUrls.push(item.ogImageUrl);
    }
  }

  // フィルタ
  ogImageUrls = ogImageUrls.filter(Boolean);

  // 画像取得
  const ogImageUrlsLength = ogImageUrls.length;
  let fetchProcessCounter = 1;

  await PromisePool.for(ogImageUrls)
    .withConcurrency(constants.processImageConcurrency)
    .process(async (ogImageUrl) => {
      const [error] = await to(imageThumbnailShortcode(ogImageUrl, '', '', 'eager'));
      if (error) {
        logger.error('[process-og-image] error', `${fetchProcessCounter++}/${ogImageUrlsLength}`, ogImageUrl);
        logger.trace(error);
        return;
      }

      logger.info('[process-og-image] fetched', `${fetchProcessCounter++}/${ogImageUrlsLength}`, ogImageUrl);
    });
})();
