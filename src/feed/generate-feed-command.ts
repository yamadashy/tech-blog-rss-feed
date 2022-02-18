import { FEED_INFO_LIST } from '../resources/feed-info-list';
import { FeedCrawler } from './utils/feed-crawler';
import { FeedGenerator } from './utils/feed-generator';
import * as fs from 'fs/promises';
import * as path from 'path';

const FEED_FETCH_CONCURRENCY = 50;
const FEED_OGP_FETCH_CONCURRENCY = 50;
const FILTER_ARTICLE_DATE = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const OUTPUT_FEED_DIR_PATH = path.join(__dirname, '../site/feeds');
const MAX_FEED_DESCRIPTION_LENGTH = 200;
const MAX_FEED_CONTENT_LENGTH = 500;

const feedCrawler = new FeedCrawler();
const feedGenerator = new FeedGenerator();

(async () => {
  // データ取得
  const feeds = await feedCrawler.fetchFeedsAsync(FEED_INFO_LIST, FEED_FETCH_CONCURRENCY);
  const processedFeeds = await feedCrawler.postProcessFeeds(feeds, FILTER_ARTICLE_DATE);
  const allFeedItems = feedCrawler.mergeAndSortResults(processedFeeds);
  const allFeedItemOgsResultMap = await feedCrawler.fetchFeedItemOgsResultMap(allFeedItems, FEED_OGP_FETCH_CONCURRENCY);
  const allFeedItemHatenaCountMap = await feedCrawler.fetchHatenaCountMap(allFeedItems);

  // フィード作成
  const feed = feedGenerator.generateFeed(
    allFeedItems,
    allFeedItemOgsResultMap,
    allFeedItemHatenaCountMap,
    MAX_FEED_DESCRIPTION_LENGTH,
    MAX_FEED_CONTENT_LENGTH,
  );

  // ファイル出力
  await fs.mkdir(OUTPUT_FEED_DIR_PATH, {
    recursive: true,
  });
  await fs.writeFile(path.join(OUTPUT_FEED_DIR_PATH, 'atom.xml'), feed.atom1(), 'utf-8');
  await fs.writeFile(path.join(OUTPUT_FEED_DIR_PATH, 'rss.xml'), feed.rss2(), 'utf-8');
  await fs.writeFile(path.join(OUTPUT_FEED_DIR_PATH, 'feed.json'), feed.json1(), 'utf-8');
})();
