import * as fs from 'fs/promises';
import * as path from 'path';
import { Feed } from 'feed';
import { OgsResultMap, CustomRssParserFeed, CustomRssParserItem, FeedItemHatenaCountMap } from './feed-crawler';
import { textToMd5Hash, textTruncate } from './common-util';
import { logger } from './logger';
import * as constants from '../../common/constants';
const Cache = require('@11ty/eleventy-cache-assets');

Cache.concurrency = 50;

type BlogFeed = {
  title: string;
  link: string;
  linkMd5Hash: string;
  ogImageUrl: string;
  ogDescription: string;
  items: {
    title: string;
    link: string;
    summary: string;
    isoDate: string;
    hatenaCount: number;
    ogImageUrl: string;
  }[];
};

export class FeedStorer {
  async storeFeeds(aggregatedFeed: Feed, storeDirPath: string): Promise<void> {
    await fs.mkdir(storeDirPath, { recursive: true });
    await fs.writeFile(path.join(storeDirPath, 'atom.xml'), aggregatedFeed.atom1(), 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'rss.xml'), aggregatedFeed.rss2(), 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'feed.json'), aggregatedFeed.json1(), 'utf-8');
  }

  async storeBlogFeeds(
    feeds: CustomRssParserFeed[],
    ogsResultMap: OgsResultMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    storeDirPath: string,
  ): Promise<void> {
    await fs.rmdir(storeDirPath, { recursive: true });
    await fs.mkdir(storeDirPath, { recursive: true });

    const blogFeeds: BlogFeed[] = [];

    for (const feed of feeds) {
      const customFeed: BlogFeed = {
        title: feed.title,
        link: feed.link,
        linkMd5Hash: textToMd5Hash(feed.link),
        ogImageUrl: ogsResultMap.get(feed.link)?.ogImage?.url,
        ogDescription: ogsResultMap.get(feed.link)?.ogDescription,
        items: [],
      };

      for (const feedItem of feed.items) {
        const feedItemSummary = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');
        customFeed.items.push({
          title: feedItem.title,
          summary: textTruncate(feedItemSummary, 100, '...'),
          link: feedItem.link,
          isoDate: feedItem.isoDate,
          hatenaCount: allFeedItemHatenaCountMap.get(feedItem.link) || 0,
          ogImageUrl: ogsResultMap.get(feedItem.link)?.ogImage?.url,
        });
      }

      blogFeeds.push(customFeed);
    }

    await fs.writeFile(path.join(storeDirPath, `blog-feeds.json`), JSON.stringify(blogFeeds, null, 2), 'utf-8');
  }

  async cacheImages(
    allFeedItems: CustomRssParserItem[],
    ogsResultMap: OgsResultMap,
    feeds: CustomRssParserFeed[],
  ): Promise<void> {
    let ogImageUrls: string[] = [];

    for (const feedItem of allFeedItems) {
      ogImageUrls.push(ogsResultMap.get(feedItem.link)?.ogImage?.url);
    }

    for (const feed of feeds) {
      ogImageUrls.push(ogsResultMap.get(feed.link)?.ogImage?.url);
    }

    // フィルタ
    ogImageUrls = ogImageUrls.filter(Boolean);

    // 画像取得
    const fetchImagePromises = ogImageUrls.map((ogImageUrl) => {
      return Cache(ogImageUrl, {
        duration: '3d',
        type: 'buffer',
        fetchOptions: {
          headers: {
            'user-agent': constants.requestUserAgent,
          },
        },
      }).catch((error: Error) => {
        logger.error('[cache-image] error', ogImageUrl);
        logger.trace(error);
      });
    });
    await Promise.all(fetchImagePromises);
  }
}
