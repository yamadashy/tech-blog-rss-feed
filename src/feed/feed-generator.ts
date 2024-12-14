import { Feed, type FeedOptions } from 'feed';
import constants from '../common/constants.js';
import { textToMd5Hash, textTruncate } from './common-util';
import type { CustomRssParserItem, FeedItemHatenaCountMap, OgObjectMap } from './feed-crawler';
import { logger } from './logger';

export interface FeedDistributionSet {
  atom: string;
  rss: string;
  json: string;
}

export interface GenerateFeedResult {
  aggregatedFeed: Feed;
  feedDistributionSet: FeedDistributionSet;
}
const escapeTextForXml = (text: string) => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const escapeAmpersand = (text: string) => {
  return text.replace(/&/g, '&amp;');
};

export class FeedGenerator {
  public generateFeeds(
    feedItems: CustomRssParserItem[],
    feedItemOgObjectMap: OgObjectMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    maxFeedDescriptionLength: number,
    maxFeedContentLength: number,
  ): GenerateFeedResult {
    const aggregatedFeed = this.generateAggregatedFeed(
      feedItems,
      feedItemOgObjectMap,
      allFeedItemHatenaCountMap,
      maxFeedDescriptionLength,
      maxFeedContentLength,
    );

    return {
      aggregatedFeed,
      feedDistributionSet: {
        // 出力されているXMLで & がエスケープされていないのでパッチ対応
        atom: escapeAmpersand(aggregatedFeed.atom1()),
        rss: escapeAmpersand(aggregatedFeed.rss2()),
        json: aggregatedFeed.json1(),
      },
    };
  }

  private generateAggregatedFeed(
    feedItems: CustomRssParserItem[],
    feedItemOgObjectMap: OgObjectMap,
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
      logger.info('[create-feed-item]', feedItem.isoDate, feedItem.title);

      const feedItemId = feedItem.guid || feedItem.link;
      const feedItemContent = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');

      const ogObject = feedItemOgObjectMap.get(feedItem.link);
      const ogImage = ogObject?.customOgImage;

      if (ogImage?.alt) {
        ogImage.alt = escapeTextForXml(ogImage.alt);
      }

      // 日付がないものは入れない
      if (!feedItem.isoDate) {
        logger.warn('[feed-item] フィードの日付がありません。', feedItem.isoDate, feedItem.title);
        continue;
      }

      outputFeed.addItem({
        id: feedItemId,
        guid: feedItemId,
        // 「記事タイトル | ブログ名」の形にする。タイトルだけでどの企業かわかるように
        title: escapeTextForXml(`${feedItem.title} | ${feedItem.blogTitle}`),
        description: escapeTextForXml(textTruncate(feedItemContent, maxFeedDescriptionLength)),
        content: escapeTextForXml(textTruncate(feedItemContent, maxFeedContentLength)),
        link: feedItem.link,
        category: (feedItem.categories || []).map((category) => {
          return {
            name: escapeTextForXml(category),
          };
        }),
        author:
          feedItem.creator && typeof feedItem.creator === 'string'
            ? [
                {
                  name: escapeTextForXml(feedItem.creator),
                },
              ]
            : undefined,
        image: ogImage?.url ? ogImage : undefined,
        published: new Date(feedItem.isoDate),
        date: new Date(feedItem.isoDate),
        extensions: [
          {
            name: '_custom',
            objects: {
              hatenaCount: allFeedItemHatenaCountMap.get(feedItem.link) || 0,
              originalTitle: escapeTextForXml(feedItem.title ?? ''),
              blogTitle: escapeTextForXml(feedItem.blogTitle),
              blogLink: feedItem.blogLink,
              blogLinkMd5Hash: textToMd5Hash(feedItem.blogLink),
              favicon: ogObject?.favicon,
            },
          },
        ],
      });
    }

    logger.info('[create-feed] finished');

    return outputFeed;
  }
}
