import * as fs from 'fs/promises';
import * as path from 'path';
import { Feed } from 'feed';
import { OgsResultMap, RssParserFeed } from './feed-crawler';
import { textToMd5Hash, textTruncate } from './common-util';
import * as RssParser from 'rss-parser';
const Cache = require('@11ty/eleventy-cache-assets');

Cache.concurrency = 50;

type CustomRssParserFeed = {
  title: string;
  linkMd5Hash: string;
  ogImageUrl: string;
  ogDescription: string;
  items: {
    title: string;
    link: string;
    summary: string;
    isoDate: string;
  }[];
};

export class FeedStorer {
  async storeFeeds(aggregatedFeed: Feed, storeDirPath: string): Promise<void> {
    await fs.mkdir(storeDirPath, { recursive: true });
    await fs.writeFile(path.join(storeDirPath, 'atom.xml'), aggregatedFeed.atom1(), 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'rss.xml'), aggregatedFeed.rss2(), 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'feed.json'), aggregatedFeed.json1(), 'utf-8');
  }

  async storeBlogFeeds(feeds: RssParserFeed[], blogOgsResultMap: OgsResultMap, storeDirPath: string): Promise<void> {
    await fs.rmdir(storeDirPath, { recursive: true });
    await fs.mkdir(storeDirPath, { recursive: true });

    const customFeeds: RssParserFeed[] = [];

    for (const feed of feeds) {
      const customFeed: CustomRssParserFeed = {
        title: feed.title,
        linkMd5Hash: textToMd5Hash(feed.link),
        ogImageUrl: blogOgsResultMap.get(feed.link)?.ogImage?.url,
        ogDescription: blogOgsResultMap.get(feed.link)?.ogDescription,
        items: [],
      };

      for (const feedItem of feed.items) {
        const feedItemSummary = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');
        customFeed.items.push({
          title: feedItem.title,
          summary: textTruncate(feedItemSummary, 100, '...'),
          link: feedItem.link,
          isoDate: feedItem.isoDate,
        });
      }

      customFeeds.push(customFeed);
    }

    await fs.writeFile(path.join(storeDirPath, `blog-feeds.json`), JSON.stringify(customFeeds, null, 2), 'utf-8');
  }

  async cacheImages(
    allFeedItems: RssParser.Item[],
    allFeedItemOgsResultMap: OgsResultMap,
    feeds: RssParserFeed[],
    blogOgsResultMap: OgsResultMap,
  ): Promise<void> {
    let ogImageUrls: string[] = [];

    for (const feedItem of allFeedItems) {
      ogImageUrls.push(allFeedItemOgsResultMap.get(feedItem.link)?.ogImage?.url);
    }

    for (const feed of feeds) {
      ogImageUrls.push(blogOgsResultMap.get(feed.link)?.ogImage?.url);
    }

    // フィルタ
    ogImageUrls = ogImageUrls.filter(Boolean);

    // 画像取得
    const fetchImagePromises = ogImageUrls.map((ogImageUrl) => {
      return Cache(ogImageUrl, {
        duration: '1d',
        type: 'buffer',
      }).catch(() => {
        console.error('[cache-image] error', ogImageUrl);
      });
    });
    await Promise.all(fetchImagePromises);
  }
}
