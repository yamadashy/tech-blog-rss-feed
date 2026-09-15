import { XMLValidator } from 'fast-xml-parser';
import RssParser from 'rss-parser';
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

  it('& や < を含むテキストを二重エスケープせず、XML は妥当で JSON はプレーンテキストになる', async () => {
    const feedItem = {
      title: 'A & <B>',
      summary: 'S & <d>',
      categories: ['c & <e>'],
      creator: 'N & <m>',
      link: 'https://example.com/test-article/?a=1&b=2',
      guid: 'https://example.com/test-article/?a=1&b=2',
      isoDate: '2026-06-09T04:03:10.000Z',
      blogTitle: 'R&D Blog',
      blogLink: 'https://example.com',
    } as CustomRssParserItem;
    const ogObjectMap = new Map([
      [feedItem.link, { customOgImage: { url: 'https://example.com/og.png?w=1&h=2', alt: 'alt & <a>' } }],
    ]) as OgObjectMap;
    const feedGenerator = new FeedGenerator();

    const { atom, rss, json } = feedGenerator.generateFeeds(
      [feedItem],
      ogObjectMap,
      new Map(),
      200,
      500,
    ).feedDistributionSet;

    // XML として妥当で、rss-parser でもパースできる
    expect(XMLValidator.validate(atom)).toBe(true);
    expect(XMLValidator.validate(rss)).toBe(true);
    await expect(new RssParser().parseString(atom)).resolves.toBeTruthy();
    await expect(new RssParser().parseString(rss)).resolves.toBeTruthy();

    // CDATA 内は HTML として一度だけエスケープされる
    expect(atom).toContain('<![CDATA[A &amp; &lt;B&gt; | R&amp;D Blog]]>');
    expect(rss).toContain('<![CDATA[A &amp; &lt;B&gt; | R&amp;D Blog]]>');
    expect(rss).toContain('alt="alt &amp; &lt;a&gt;"');
    expect(atom).not.toContain('&amp;amp;');
    expect(rss).not.toContain('&amp;amp;');

    // JSON Feed の title / summary / tags / _custom はプレーンテキスト、content_html は HTML
    const jsonItem = JSON.parse(json).items[0];
    expect(jsonItem.title).toBe('A & <B> | R&D Blog');
    expect(jsonItem.summary).toBe('S & <d>');
    expect(jsonItem.content_html).toBe('S &amp; &lt;d&gt;');
    expect(jsonItem.tags).toEqual(['c & <e>']);
    expect(jsonItem.author.name).toBe('N & <m>');
    expect(jsonItem.url).toBe('https://example.com/test-article/?a=1&b=2');
    expect(jsonItem._custom.originalTitle).toBe('A & <B>');
    expect(jsonItem._custom.blogTitle).toBe('R&D Blog');
  });
});
