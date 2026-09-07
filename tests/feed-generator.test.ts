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

  it('URLでないguidはlinkをidにしてAtomフィードを生成できる', () => {
    const feedItem = {
      title: 'テスト記事',
      link: 'https://example.com/test-article/',
      guid: '6a853e4d08752169b9ab7316',
      isoDate: '2026-06-09T04:03:10.000Z',
      blogTitle: 'Example Tech Blog',
      blogLink: 'https://example.com',
    } as CustomRssParserItem;
    const feedGenerator = new FeedGenerator();

    const result = feedGenerator.generateFeeds([feedItem], new Map(), new Map(), 200, 500);

    expect(result.aggregatedFeed.items[0].id).toEqual('https://example.com/test-article/');
    expect(result.feedDistributionSet.atom).toContain('<id>https://example.com/test-article/</id>');
  });

  it('不正なリンクのitemはスキップしてフィード生成できる', () => {
    const invalidItem = {
      title: 'テスト記事',
      link: 'not-a-url',
      guid: '6a853e4d08752169b9ab7316',
      isoDate: '2026-06-09T04:03:10.000Z',
      blogTitle: 'Example Tech Blog',
      blogLink: 'https://example.com',
    } as CustomRssParserItem;
    const validItem = {
      title: 'テスト記事',
      link: 'https://example.com/test-article/',
      guid: 'https://example.com/?p=1',
      isoDate: '2026-06-09T04:03:10.000Z',
      blogTitle: 'Example Tech Blog',
      blogLink: 'https://example.com',
    } as CustomRssParserItem;
    const feedGenerator = new FeedGenerator();

    const result = feedGenerator.generateFeeds([invalidItem, validItem], new Map(), new Map(), 200, 500);

    expect(result.aggregatedFeed.items).toHaveLength(1);
    expect(result.aggregatedFeed.items[0].link).toEqual('https://example.com/test-article/');
    expect(result.feedDistributionSet.atom).toContain('<feed');
  });
});
