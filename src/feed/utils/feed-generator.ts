import * as RssParser from 'rss-parser';
import { Feed, FeedOptions } from 'feed';
import { FeedItemHatenaCountMap, OgsResultMap } from './feed-crawler';
import { textTruncate, urlRemoveQueryParams } from './common-util';
import { logger } from './logger';

const SITE_URL = 'https://yamadashy.github.io/tech-blog-rss-feed';

export class FeedGenerator {
  generateFeed(
    feedItems: RssParser.Item[],
    feedItemOgsResultMap: OgsResultMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    maxFeedDescriptionLength: number,
    maxFeedContentLength: number,
  ): Feed {
    const outputFeed = new Feed({
      title: '企業テックブログRSS',
      description: '企業のテックブログの更新をまとめたRSSフィード',
      language: 'ja',
      id: `${SITE_URL}/`,
      link: `${SITE_URL}/`,
      feedLinks: {
        rss: `${SITE_URL}/feed/rss.xml`,
        atom: `${SITE_URL}/feed/atom.xml`,
        json: `${SITE_URL}/feed/feed.json`,
      },
      image: `${SITE_URL}/images/icon.png`,
      favicon: `${SITE_URL}/images/favicon.ico`,
      copyright: 'yamadashy/tech-blog-rss-feed',
      generator: 'yamadashy/tech-blog-rss-feed',
      updated: new Date(),
    } as FeedOptions);

    for (const feedItem of feedItems) {
      logger.info('[feed-item]', feedItem.isoDate, feedItem.title);

      const feedItemId = feedItem.guid || feedItem.link;
      const feedItemContent = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');

      const ogsResult = feedItemOgsResultMap.get(feedItem.link);
      const ogImage = ogsResult?.ogImage;

      outputFeed.addItem({
        id: feedItemId,
        guid: feedItemId,
        title: feedItem.title,
        description: textTruncate(feedItemContent, maxFeedDescriptionLength, '...'),
        content: textTruncate(feedItemContent, maxFeedContentLength, '...'),
        link: feedItem.link,
        category: (feedItem.categories || []).map((category) => {
          return {
            name: category,
          };
        }),
        author:
          feedItem.creator && typeof feedItem.creator === 'string'
            ? [
                {
                  name: feedItem.creator,
                },
              ]
            : null,
        image:
          ogImage && ogImage.url
            ? {
                type: ogImage.type,
                url: urlRemoveQueryParams(ogImage.url),
              }
            : null,
        published: feedItem.isoDate ? new Date(feedItem.isoDate) : null,
        date: feedItem.isoDate ? new Date(feedItem.isoDate) : null,
        extensions: [
          {
            name: 'hatenaCount',
            objects: allFeedItemHatenaCountMap.get(feedItem.link),
          },
        ],
      });
    }

    return outputFeed;
  }

  /**
   * rss-parser で変換してみてエラーが出ないか確認
   */
  public async validateAggregatedFeed(outputFeed: Feed): Promise<boolean> {
    const rssParser = new RssParser();
    const feedAtom = outputFeed.atom1();
    const feedRss = outputFeed.rss2();

    let isValid = true;

    await rssParser.parseString(feedAtom).catch((error) => {
      isValid = false;
      logger.error('[feed-generator] validate feed atom error', error);
    });
    await rssParser.parseString(feedRss).catch((error) => {
      isValid = false;
      logger.error('[feed-generator] validate feed rss error', error);
    });

    return isValid;
  }
}
