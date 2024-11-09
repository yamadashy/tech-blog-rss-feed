import RssParser from 'rss-parser';
import { describe, expect, it } from 'vitest';
import { exponentialBackoff } from '../src/feed/utils/common-util';
import { FeedCrawler } from '../src/feed/utils/feed-crawler';
import { FEED_INFO_LIST, type FeedInfo } from '../src/resources/feed-info-list';

// 設定のテスト
describe('FEED_INFO_LIST', () => {
  it('FEED_INFO_LIST の設定が正しい', () => {
    expect(() => {
      FeedCrawler.validateFeedInfoList(FEED_INFO_LIST);
    }).not.toThrow();
  });
});
