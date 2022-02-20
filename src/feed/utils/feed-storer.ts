import * as fs from 'fs/promises';
import * as path from 'path';
import { Feed } from 'feed';
import { OgsResultMap, RssParserFeed } from './feed-crawler';
import * as crypto from 'crypto';

type CustomRssParserFeed = RssParserFeed & {
  hash: string;
  ogImageUrl: string;
  ogDescription: string;
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

    for (const feed of feeds) {
      const feedLinkMd5 = FeedStorer.md5hex(feed.link);

      // TODO: もっと前の段階で入れる？
      const customFeed = feed as CustomRssParserFeed;
      customFeed.hash = feedLinkMd5;
      customFeed.ogImageUrl = blogOgsResultMap.get(customFeed.link)?.ogImage?.url;
      customFeed.ogDescription = blogOgsResultMap.get(customFeed.link)?.ogDescription;

      await fs.writeFile(path.join(storeDirPath, `${feedLinkMd5}.json`), JSON.stringify(customFeed), 'utf-8');
    }
  }

  private static md5hex(text: string) {
    const md5 = crypto.createHash('md5');
    return md5.update(text, 'binary').digest('hex');
  }
}
