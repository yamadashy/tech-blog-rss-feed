import { FEED_INFO_LIST } from '../src/resources/feed-info-list';
import * as RssParser from 'rss-parser';
import { FeedCrawler } from '../src/feed/utils/feed-crawler';
import { PromisePool } from '@supercharge/promise-pool';

test('FEED_INFO_LIST の設定が正しい', () => {
  expect(() => {
    FeedCrawler.validateFeedInfoList(FEED_INFO_LIST);
  }).not.toThrow();
});

test(
  'フィードがすべて取得可能',
  async () => {
    const rssParser = new RssParser();
    const fetchErrors: Error[] = [];

    return PromisePool.for(FEED_INFO_LIST)
      .withConcurrency(20)
      .handleError(async (error, feedInfo, pool) => {
        fetchErrors.push(error);
        pool.stop();
      })
      .process(async (feedInfo) => {
        const feed = await rssParser.parseURL(feedInfo.url);
        expect(feed.items.length).toBeGreaterThanOrEqual(0);
      })
      .then(() => {
        expect(fetchErrors).toHaveLength(0);
      });
  },
  5 * 60 * 1000,
);
