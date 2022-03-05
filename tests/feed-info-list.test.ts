import { FEED_INFO_LIST, FeedInfo } from '../src/resources/feed-info-list';
import * as RssParser from 'rss-parser';
import { FeedCrawler } from '../src/feed/utils/feed-crawler';
import * as retry from 'async-retry';

const rssParser = new RssParser();

// 設定のテスト
test('FEED_INFO_LIST の設定が正しい', () => {
  expect(() => {
    FeedCrawler.validateFeedInfoList(FEED_INFO_LIST);
  }).not.toThrow();
});

// フィード取得テスト
FEED_INFO_LIST.map((feedInfo: FeedInfo) => {
  test.concurrent(
    `フィードが取得可能 - ${feedInfo.label} / ${feedInfo.url}`,
    async () => {
      const feed = await retry(
        async () => {
          return rssParser.parseURL(feedInfo.url);
        },
        {
          retries: 3,
        },
      );

      expect(feed.items.length).toBeGreaterThanOrEqual(0);
    },
    15 * 1000,
  );
});
