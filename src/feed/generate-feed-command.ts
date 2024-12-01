import * as path from 'node:path';
import * as url from 'node:url';
import { FEED_INFO_LIST } from '../resources/feed-info-list';
import { FeedCrawler } from './utils/feed-crawler';
import { FeedGenerator } from './utils/feed-generator';
import { ImagePrecacher as FeedImagePrecacher } from './utils/feed-image-precacher';
import { FeedStorer } from './utils/feed-storer';
import { FeedValidator } from './utils/feed-validator';
import { logger } from './utils/logger';

const dirName = url.fileURLToPath(new URL('.', import.meta.url));

const FEED_FETCH_CONCURRENCY = 50;
const FEED_OG_FETCH_CONCURRENCY = 20;
const FETCH_IMAGE_CONCURRENCY = 100;
const FILTER_ARTICLE_DATE = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
const MAX_FEED_DESCRIPTION_LENGTH = 200;
const MAX_FEED_CONTENT_LENGTH = 500;
const STORE_FEEDS_DIR_PATH = path.join(dirName, '../site/feeds');
const STORE_BLOG_FEEDS_DIR_PATH = path.join(dirName, '../site/blog-feeds');

const feedCrawler = new FeedCrawler();
const feedGenerator = new FeedGenerator();
const feedValidator = new FeedValidator();
const feedStorer = new FeedStorer();
const feedImagePrecacher = new FeedImagePrecacher();

(async () => {
  // フィード取得
  const crawlFeedsResult = await feedCrawler.crawlFeeds(
    FEED_INFO_LIST,
    FEED_FETCH_CONCURRENCY,
    FEED_OG_FETCH_CONCURRENCY,
    FILTER_ARTICLE_DATE,
  );

  // まとめフィード作成
  const ogObjectMap = new Map([...crawlFeedsResult.feedItemOgObjectMap, ...crawlFeedsResult.feedBlogOgObjectMap]);
  const generateFeedsResult = feedGenerator.generateFeeds(
    crawlFeedsResult.feedItems,
    ogObjectMap,
    crawlFeedsResult.feedItemHatenaCountMap,
    MAX_FEED_DESCRIPTION_LENGTH,
    MAX_FEED_CONTENT_LENGTH,
  );

  // ファイル出力
  try {
    await feedStorer.storeFeeds(
      generateFeedsResult.feedDistributionSet,
      STORE_FEEDS_DIR_PATH,
      crawlFeedsResult.feeds,
      ogObjectMap,
      crawlFeedsResult.feedItemHatenaCountMap,
      STORE_BLOG_FEEDS_DIR_PATH,
    );
  } catch (e) {
    const error = new Error('Failed to store feeds', {
      cause: e,
    });
    console.error(error);
    throw error;
  }

  // 画像の事前キャッシュ
  try {
    await feedImagePrecacher.fetchAndCacheFeedImages(
      crawlFeedsResult.feeds,
      crawlFeedsResult.feedItems,
      ogObjectMap,
      FETCH_IMAGE_CONCURRENCY,
    );
  } catch (e) {
    const error = new Error('Failed to cache feed images', {
      cause: e,
    });
    console.error(error);
    throw error;
  }

  // 最後にまとめフィードのバリデーション
  try {
    logger.info('フィードのバリデーション開始');

    await feedValidator.assertFeed(generateFeedsResult.aggregatedFeed);
    await feedValidator.assertXmlFeed('atom', generateFeedsResult.feedDistributionSet.atom);
    await feedValidator.assertXmlFeed('rss', generateFeedsResult.feedDistributionSet.rss);

    logger.info('フィードのバリデーション完了');
  } catch (e) {
    const error = new Error('Failed to validate feed', {
      cause: e,
    });
    console.error(error);
    throw error;
  }
})();
