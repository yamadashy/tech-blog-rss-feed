import { describe, expect, it } from 'vitest';
import type { CustomRssParserItem, OgObjectMap } from '../src/feed/feed-crawler';
import { FeedGenerator } from '../src/feed/feed-generator';

describe('FeedGenerator', () => {
  it('不正なOG画像URLは画像なしとしてフィード生成できる', () => {
    const feedItem = {
      title: 'テスト記事',
      link: 'https://example.com/test-article/',
      guid: 'https://example.com/?p=1',
      isoDate: '2026-06-09T04:03:10.000Z',
      blogTitle: 'Example Tech Blog',
      blogLink: 'https://example.com',
    } as CustomRssParserItem;
    const ogObjectMap = new Map([
      [
        feedItem.link,
        {
          // ホスト名に %20 を含むURLは new URL() が throw する
          customOgImage: {
            url: 'http://Invalid%20Og%20Image',
          },
        },
      ],
    ]) as OgObjectMap;
    const feedGenerator = new FeedGenerator();

    const result = feedGenerator.generateFeeds([feedItem], ogObjectMap, new Map(), 200, 500);

    expect(result.aggregatedFeed.items[0].image).toBeUndefined();
    expect(result.feedDistributionSet.atom).toContain('<feed');
  });
});
