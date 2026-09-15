import { Feed, type FeedOptions } from 'feed';
import constants from '../common/constants.js';
import { isValidHttpUrl, textToMd5Hash, textTruncate } from './common-util';
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
/**
 * XML 向けのエスケープ。
 * feed ライブラリ（v6）はテキストノード・URL・属性値の `&` は自前でエスケープするが、
 * 属性値の `<` `>`（category の term / label）と enclosure の alt はエスケープしないので、そこだけ補う。
 * title / description / content は CDATA（Atom では type="html"）として出力されるので、
 * HTML として正しくなるようこちらでエスケープする。
 */
const escapeTextForXml = (text: string) => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const escapeAngleBrackets = (text: string) => {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * - `html`: Atom / RSS 用。title / description は HTML としてエスケープする
 * - `plain`: JSON Feed 用。title / summary はプレーンテキストなのでエスケープしない（content_html は HTML なのでエスケープする）
 */
type FeedTextFormat = 'html' | 'plain';

interface PreparedFeedItem {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  categories: string[];
  creator?: string;
  image?: { url: string; alt?: string; type?: string; length?: number };
  date: Date;
  hatenaCount: number;
  originalTitle: string;
  blogTitle: string;
  blogLink: string;
  favicon?: string;
}

export class FeedGenerator {
  public generateFeeds(
    feedItems: CustomRssParserItem[],
    feedItemOgObjectMap: OgObjectMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    maxFeedDescriptionLength: number,
    maxFeedContentLength: number,
  ): GenerateFeedResult {
    const preparedFeedItems = this.prepareFeedItems(
      feedItems,
      feedItemOgObjectMap,
      allFeedItemHatenaCountMap,
      maxFeedDescriptionLength,
      maxFeedContentLength,
    );

    // XML と JSON でテキストのエスケープ方法が違うので、それぞれ別の Feed を組み立てる
    const xmlFeed = this.createFeed(preparedFeedItems, 'html');
    const jsonFeed = this.createFeed(preparedFeedItems, 'plain');

    logger.info('[create-feed] finished');

    return {
      aggregatedFeed: xmlFeed,
      feedDistributionSet: {
        atom: xmlFeed.atom1(),
        rss: xmlFeed.rss2(),
        json: jsonFeed.json1(),
      },
    };
  }

  private prepareFeedItems(
    feedItems: CustomRssParserItem[],
    feedItemOgObjectMap: OgObjectMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    maxFeedDescriptionLength: number,
    maxFeedContentLength: number,
  ): PreparedFeedItem[] {
    const preparedFeedItems: PreparedFeedItem[] = [];

    for (const feedItem of feedItems) {
      logger.info('[create-feed-item]', feedItem.isoDate, feedItem.title);

      // AtomのidはURLとして扱われるため、URLでないguidは使わない
      if (!isValidHttpUrl(feedItem.link)) {
        logger.warn('[feed-item] フィードのリンクが不正です。', feedItem.link, feedItem.title);
        continue;
      }
      const feedItemId = feedItem.guid && isValidHttpUrl(feedItem.guid) ? feedItem.guid : feedItem.link;
      const feedItemContent = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');

      const ogObject = feedItemOgObjectMap.get(feedItem.link);
      const ogImage = ogObject?.customOgImage;
      const feedItemImage = ogImage?.url && isValidHttpUrl(ogImage.url) ? { ...ogImage } : undefined;

      // 日付がないものは入れない
      if (!feedItem.isoDate) {
        logger.warn('[feed-item] フィードの日付がありません。', feedItem.isoDate, feedItem.title);
        continue;
      }

      preparedFeedItems.push({
        id: feedItemId,
        // 「記事タイトル | ブログ名」の形にする。タイトルだけでどの企業かわかるように
        title: `${feedItem.title} | ${feedItem.blogTitle}`,
        description: textTruncate(feedItemContent, maxFeedDescriptionLength),
        content: textTruncate(feedItemContent, maxFeedContentLength),
        link: feedItem.link,
        categories: feedItem.categories || [],
        creator: feedItem.creator && typeof feedItem.creator === 'string' ? feedItem.creator : undefined,
        image: feedItemImage,
        date: new Date(feedItem.isoDate),
        hatenaCount: allFeedItemHatenaCountMap.get(feedItem.link) || 0,
        originalTitle: feedItem.title ?? '',
        blogTitle: feedItem.blogTitle,
        blogLink: feedItem.blogLink,
        favicon: ogObject?.favicon,
      });
    }

    return preparedFeedItems;
  }

  private createFeed(preparedFeedItems: PreparedFeedItem[], textFormat: FeedTextFormat): Feed {
    const escapeText = textFormat === 'html' ? escapeTextForXml : (text: string) => text;
    const escapeCategory = textFormat === 'html' ? escapeAngleBrackets : (text: string) => text;

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

    for (const preparedFeedItem of preparedFeedItems) {
      // alt は RSS の enclosure 属性にそのまま出るので常にエスケープする（JSON Feed には出ない）
      const image = preparedFeedItem.image
        ? { ...preparedFeedItem.image, alt: preparedFeedItem.image.alt && escapeTextForXml(preparedFeedItem.image.alt) }
        : undefined;

      outputFeed.addItem({
        id: preparedFeedItem.id,
        guid: preparedFeedItem.id,
        title: escapeText(preparedFeedItem.title),
        description: escapeText(preparedFeedItem.description),
        // content は Atom / RSS / JSON Feed（content_html）のいずれでも HTML なので常にエスケープする
        content: escapeTextForXml(preparedFeedItem.content),
        link: preparedFeedItem.link,
        category: preparedFeedItem.categories.map((category) => {
          return {
            name: escapeCategory(category),
          };
        }),
        author: preparedFeedItem.creator ? [{ name: preparedFeedItem.creator }] : undefined,
        image,
        published: preparedFeedItem.date,
        date: preparedFeedItem.date,
        extensions: [
          {
            name: '_custom',
            // サイト表示用。feed.json から読むのでエスケープしない（XML 側ではライブラリがエスケープする）
            objects: {
              hatenaCount: preparedFeedItem.hatenaCount,
              originalTitle: preparedFeedItem.originalTitle,
              blogTitle: preparedFeedItem.blogTitle,
              blogLink: preparedFeedItem.blogLink,
              blogLinkMd5Hash: textToMd5Hash(preparedFeedItem.blogLink),
              favicon: preparedFeedItem.favicon,
            },
          },
        ],
      });
    }

    return outputFeed;
  }
}
