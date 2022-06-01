import { FEED_INFO_LIST } from '../resources/feed-info-list';
import { FeedCrawler } from './utils/feed-crawler';
import { FeedGenerator } from './utils/feed-generator';
import * as path from 'path';
import { FeedStorer } from './utils/feed-storer';
import { to } from 'await-to-js';

const FEED_FETCH_CONCURRENCY = 50;
const FEED_OGP_FETCH_CONCURRENCY = 20;
const OG_IMAGE_FETCH_CONCURRENCY = 20;
const FILTER_ARTICLE_DATE = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const MAX_FEED_DESCRIPTION_LENGTH = 200;
const MAX_FEED_CONTENT_LENGTH = 500;
const STORE_FEEDS_DIR_PATH = path.join(__dirname, '../site/feeds');
const STORE_BLOG_FEEDS_DIR_PATH = path.join(__dirname, '../site/blog-feeds');

const feedCrawler = new FeedCrawler();
const feedGenerator = new FeedGenerator();
const feedStorer = new FeedStorer();

(async () => {
  // フィード取得、後処理
  const feeds = await feedCrawler.fetchFeedsAsync(FEED_INFO_LIST, FEED_FETCH_CONCURRENCY);
  const allFeedItems = feedCrawler.aggregateFeeds(feeds, FILTER_ARTICLE_DATE);

  // フィード関連データ取得
  const [errorFetchFeedData, results] = await to(
    Promise.all([
      feedCrawler.fetchFeedItemOgsResultMap(allFeedItems, FEED_OGP_FETCH_CONCURRENCY),
      feedCrawler.fetchHatenaCountMap(allFeedItems),
      feedCrawler.fetchFeedOgsResultMap(feeds, FEED_OGP_FETCH_CONCURRENCY),
    ]),
  );
  if (errorFetchFeedData) {
    throw new Error('フィード関連データの取得に失敗しました');
  }
  const [allFeedItemOgsResultMap, allFeedItemHatenaCountMap, feedOgsResultMap] = results;

  // まとめフィード作成
  const ogsResultMap = new Map([...allFeedItemOgsResultMap, ...feedOgsResultMap]);
  const aggregatedFeed = feedGenerator.generateFeed(
    allFeedItems,
    ogsResultMap,
    allFeedItemHatenaCountMap,
    MAX_FEED_DESCRIPTION_LENGTH,
    MAX_FEED_CONTENT_LENGTH,
  );

  // まとめフィードのバリデーション。エラーならすぐに終了する
  const isValid = await feedGenerator.validateAggregatedFeed(aggregatedFeed);
  if (!isValid) {
    throw new Error('まとめフィードのバリデーションエラーです');
  }

  // ファイル出力、画像キャッシュ
  const [errorStoreFeed] = await to(
    Promise.all([
      feedStorer.storeFeeds(aggregatedFeed, STORE_FEEDS_DIR_PATH),
      feedStorer.storeBlogFeeds(feeds, ogsResultMap, allFeedItemHatenaCountMap, STORE_BLOG_FEEDS_DIR_PATH),
      // TODO: プロセスが終了しなくなるので一旦コメントアウト。あとで調査
      // feedCrawler.fetchAndCacheOgImages(allFeedItems, ogsResultMap, feeds, OG_IMAGE_FETCH_CONCURRENCY),
    ]),
  );
  if (errorStoreFeed) {
    throw new Error('ファイル出力に失敗しました');
  }
})();
