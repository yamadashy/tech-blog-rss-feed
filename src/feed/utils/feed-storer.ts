import * as fs from 'fs/promises';
import * as path from 'path';
import { OgsResultMap, CustomRssParserFeed, FeedItemHatenaCountMap } from './feed-crawler';
import { textToMd5Hash, textTruncate } from './common-util';
import { OutputFeedSet } from './feed-generator';
import { logger } from './logger';

export type BlogFeed = {
  title: string;
  link: string;
  linkMd5Hash: string;
  ogImageUrl: string;
  ogDescription: string;
  items: {
    title: string;
    link: string;
    summary: string;
    content_html: string;
    isoDate: string;
    hatenaCount: number;
    ogImageUrl: string;
  }[];
};

export class FeedStorer {
  async storeFeeds(outputFeedSet: OutputFeedSet, storeDirPath: string): Promise<void> {
    await fs.mkdir(storeDirPath, { recursive: true });
    await fs.writeFile(path.join(storeDirPath, 'atom.xml'), outputFeedSet.atom, 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'rss.xml'), outputFeedSet.rss, 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'feed.json'), outputFeedSet.json, 'utf-8');

    logger.info('[store-feeds] finished');
  }

  async storeBlogFeeds(
    feeds: CustomRssParserFeed[],
    ogsResultMap: OgsResultMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    storeDirPath: string,
  ): Promise<void> {
    await fs.rm(storeDirPath, { recursive: true, force: true });
    await fs.mkdir(storeDirPath, { recursive: true });

    const blogFeeds: BlogFeed[] = [];

    for (const feed of feeds) {
      const customFeed: BlogFeed = {
        title: feed.title,
        link: feed.link,
        linkMd5Hash: textToMd5Hash(feed.link),
        ogImageUrl: ogsResultMap.get(feed.link)?.ogImage?.url || '',
        ogDescription: ogsResultMap.get(feed.link)?.ogDescription || '',
        items: [],
      };

      for (const feedItem of feed.items) {
        const feedItemContent = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');
        customFeed.items.push({
          title: feedItem.title || '',
          summary: textTruncate(feedItemContent, 200, '...'),
          content_html: textTruncate(feedItemContent, 1000, '...'),
          link: feedItem.link,
          isoDate: feedItem.isoDate,
          hatenaCount: allFeedItemHatenaCountMap.get(feedItem.link) || 0,
          ogImageUrl: ogsResultMap.get(feedItem.link)?.ogImage?.url || '',
        });
      }

      blogFeeds.push(customFeed);
    }

    await fs.writeFile(path.join(storeDirPath, `blog-feeds.json`), JSON.stringify(blogFeeds, null, 2), 'utf-8');

    logger.info('[store-blog-feeds] finished');
  }
}
