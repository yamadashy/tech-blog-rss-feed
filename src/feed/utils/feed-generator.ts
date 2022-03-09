import * as RssParser from 'rss-parser';
import { Feed, FeedOptions } from 'feed';
import { CustomRssParserItem, FeedItemHatenaCountMap, OgsResultMap } from './feed-crawler';
import { textToMd5Hash, textTruncate, urlRemoveQueryParams } from './common-util';
import { logger } from './logger';
import * as constants from '../../common/constants';

export class FeedGenerator {
  generateFeed(
    feedItems: CustomRssParserItem[],
    feedItemOgsResultMap: OgsResultMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    maxFeedDescriptionLength: number,
    maxFeedContentLength: number,
  ): Feed {
    const outputFeed = new Feed({
      title: constants.feedTitle,
      description: constants.feedDescription,
      language: constants.feedLanguage,
      id: `${constants.siteUrlStem}/`,
      link: `${constants.siteUrlStem}/`,
      feedLinks: constants.feedUrls,
      image: `${constants.siteUrlStem}/images/icon.png`,
      favicon: `${constants.siteUrlStem}/images/favicon.ico`,
      copyright: constants.feedCopyright,
      generator: constants.feedGenerator,
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
        // 「記事タイトル | ブログ名」の形にする。タイトルだけでどの企業かわかるように
        title: `${feedItem.title} | ${feedItem.blogTitle}`,
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
            name: '_custom',
            objects: {
              hatenaCount: allFeedItemHatenaCountMap.get(feedItem.link) || 0,
              originalTitle: feedItem.title,
              blogTitle: feedItem.blogTitle,
              blogLink: feedItem.blogLink,
              blogLinkMd5Hash: textToMd5Hash(feedItem.blogLink),
            },
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
