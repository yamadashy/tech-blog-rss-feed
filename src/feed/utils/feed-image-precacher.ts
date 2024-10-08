import EleventyFetch from '@11ty/eleventy-fetch';
import { PromisePool } from '@supercharge/promise-pool';
import { to } from 'await-to-js';
import { imageCacheOptions } from '../../common/eleventy-cache-option';
import type { CustomRssParserFeed, CustomRssParserItem, OgObjectMap } from './feed-crawler';
import { logger } from './logger';

export class ImagePrecacher {
  public async fetchAndCacheFeedImages(
    feeds: CustomRssParserFeed[],
    feedItems: CustomRssParserItem[],
    ogObjectMap: OgObjectMap,
    concurrency: number,
  ): Promise<void> {
    let ogImageUrls: string[] = [];

    for (const feed of feeds) {
      ogImageUrls.push(ogObjectMap.get(feed.link)?.customOgImage?.url || '');
    }

    for (const feedItem of feedItems) {
      ogImageUrls.push(ogObjectMap.get(feedItem.link)?.customOgImage?.url || '');
    }

    // フィルタ
    ogImageUrls = ogImageUrls.filter(Boolean);

    // 画像取得
    const ogImageUrlsLength = ogImageUrls.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(ogImageUrls)
      .withConcurrency(concurrency)
      .process(async (ogImageUrl) => {
        const [error] = await to(
          EleventyFetch(ogImageUrl, {
            type: 'buffer',
            duration: imageCacheOptions.duration,
            concurrency,
          }),
        );
        if (error) {
          logger.error('[cache-og-image] error', `${fetchProcessCounter++}/${ogImageUrlsLength}`, ogImageUrl);
          logger.trace(error);
          return;
        }

        logger.info('[cache-og-image] fetched', `${fetchProcessCounter++}/${ogImageUrlsLength}`, ogImageUrl);
      });

    logger.info('[cache-og-image] finished');
  }
}
