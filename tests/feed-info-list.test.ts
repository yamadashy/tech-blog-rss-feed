import { FEED_INFO_LIST, FeedInfo } from '../src/resources/feed-info-list';
import { FeedCrawler } from '../src/feed/utils/feed-crawler';
import { describe, it, expect } from 'vitest';
import { exponentialBackoff } from '../src/feed/utils/common-util';
import RssParser from 'rss-parser';

const rssParser = new RssParser({
  maxRedirects: 0,
});

// 設定のテスト
describe('FEED_INFO_LIST', () => {
  it('FEED_INFO_LIST の設定が正しい', () => {
    expect(() => {
      FeedCrawler.validateFeedInfoList(FEED_INFO_LIST);
    }).not.toThrow();
  });
});

// フィード取得テスト
describe('フィードが取得可能', () => {
  FEED_INFO_LIST.map((feedInfo: FeedInfo) => {
    const testTitle = `${feedInfo.label} / ${feedInfo.url}`;
    it.concurrent(
      testTitle,
      async () => {
        const feed = await exponentialBackoff(async () => {
          return rssParser.parseURL(feedInfo.url);
        });
        expect(feed.items.length).toBeGreaterThanOrEqual(0);
      },
      180 * 1000,
    );
  });
});
