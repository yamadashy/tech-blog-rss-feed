import RssParser from 'rss-parser';
// フィード取得テスト
import { describe, expect, it } from 'vitest';
import { exponentialBackoff } from '../../src/feed/common-util';
import { FEED_INFO_LIST, type FeedInfo } from '../../src/resources/feed-info-list';

const rssParser = new RssParser({
  maxRedirects: 0,
});

const knownUnreliableFeeds = [
  'https://qiita.com/organizations/trail-blazer',
  'https://techblog.aumo.co.jp/feed',
  'https://engineering.kabu.com/feed',
  'https://dev.icare.jpn.com/feed/',
  'https://zenn.dev/p/zoome/feed',
  'https://tech-magazine.opt.ne.jp/feed',
  'https://tech.torana.co.jp/feed',
  'https://engineering.mercari.com/blog/feed.xml'
];

describe('フィードが取得可能', () => {
  FEED_INFO_LIST.map((feedInfo: FeedInfo) => {
    const testTitle = `${feedInfo.label} / ${feedInfo.url}`;
    const isUnreliableFeed = knownUnreliableFeeds.includes(feedInfo.url);
    
    it.concurrent(
      testTitle,
      async () => {
        try {
          const feed = await exponentialBackoff(
            async () => {
              return rssParser.parseURL(feedInfo.url);
            },
            3000,
            5,
          );
          expect(feed.items.length).toBeGreaterThanOrEqual(0);
        } catch (error) {
          if (isUnreliableFeed) {
            console.warn(`Skipping test for known unreliable feed: ${feedInfo.url}`);
            return;
          }
          throw error;
        }
      },
      180 * 1000,
    );
  });
});
