import { URL } from 'node:url';
import { PromisePool } from '@supercharge/promise-pool';
import { to } from 'await-to-js';
import dayjs from 'dayjs';
import { create as flatCacheCreate } from 'flat-cache';
import { default as ogs } from 'open-graph-scraper';
import type { ImageObject, OgObject, OpenGraphScraperOptions } from 'open-graph-scraper/types/lib/types';
import RssParser from 'rss-parser';
import constants from '../common/constants';
import type { FeedInfo } from '../resources/feed-info-list';
import {
  exponentialBackoff,
  fetchHatenaCountMap,
  isValidHttpUrl,
  objectDeepCopy,
  removeInvalidUnicode,
  textToMd5Hash,
  urlRemoveQueryParams,
} from './common-util';
import { FeedValidator } from './feed-validator';
import { logger } from './logger';

export type CustomOgObject = OgObject & {
  // 画像は一つだけとする
  customOgImage?: ImageObject;
};
export type OgObjectMap = Map<string, CustomOgObject>;
export type FeedItemHatenaCountMap = Map<string, number>;
export type CustomRssParserItem = RssParser.Item & {
  link: string;
  isoDate: string;
  blogTitle: string;
  blogLink: string;
};
export type CustomRssParserFeed = RssParser.Output<CustomRssParserItem> & {
  link: string;
  title: string;
};

export interface ClawlFeedsResult {
  feeds: CustomRssParserFeed[];
  feedItems: CustomRssParserItem[];
  feedItemOgObjectMap: OgObjectMap;
  feedItemHatenaCountMap: FeedItemHatenaCountMap;
  feedBlogOgObjectMap: OgObjectMap;
}

export class FeedCrawler {
  private rssParser;
  private feedValidator;

  constructor() {
    this.rssParser = new RssParser({
      maxRedirects: 5,
      timeout: 1000 * 10,
      headers: {
        'user-agent': constants.requestUserAgent,
      },
    });
    this.feedValidator = new FeedValidator();
  }

  public async crawlFeeds(
    feedInfoList: FeedInfo[],
    feedFetchConcurrency: number,
    feedOgFetchConcurrency: number,
    aggregateFeedStartAt: Date,
  ): Promise<ClawlFeedsResult> {
    // フィード取得してまとめる
    const feeds = await this.fetchFeedsAsync(feedInfoList, feedFetchConcurrency);
    const allFeedItems = this.aggregateFeeds(feeds, aggregateFeedStartAt);

    // OGPなどの情報取得
    const [errorFetchFeedData, results] = await to(
      Promise.all([
        this.fetchFeedItemOgObjectMap(allFeedItems, feedOgFetchConcurrency),
        this.fetchHatenaCountMap(allFeedItems),
        this.fetchFeedBlogOgObjectMap(feeds, feedOgFetchConcurrency),
      ]),
    );
    if (errorFetchFeedData) {
      throw new Error('フィード関連データの取得に失敗しました');
    }

    return {
      feeds: feeds,
      feedItems: allFeedItems,
      feedItemOgObjectMap: results[0],
      feedItemHatenaCountMap: results[1],
      feedBlogOgObjectMap: results[2],
    };
  }

  /**
   * フィード取得 + 取得後の調整
   */
  private async fetchFeedsAsync(feedInfoList: FeedInfo[], concurrency: number): Promise<CustomRssParserFeed[]> {
    FeedCrawler.validateFeedInfoList(feedInfoList);

    const feedInfoListLength = feedInfoList.length;
    let fetchProcessCounter = 1;

    const feeds: CustomRssParserFeed[] = [];
    const feedLinkSet = new Set<string>();

    await PromisePool.for(feedInfoList)
      .withConcurrency(concurrency)
      .process(async (feedInfo) => {
        const [error, feed] = await to(
          exponentialBackoff(async (attemptCount: number) => {
            if (attemptCount > 0) {
              logger.warn(`[fetch-feed] retry ${feedInfo.url}`);
            }

            const feedCacheKey = `feed-${textToMd5Hash(feedInfo.url)}`;
            const feedCache = flatCacheCreate({
              cacheId: feedCacheKey,
              ttl: constants.fetchedFeedCacheDurationInHours * 60 * 60 * 1000,
            });
            const cachedData = feedCache.get<string>(feedCacheKey);
            let feedData: string;

            if (cachedData) {
              logger.trace('[fetch-feed] cache hit', feedInfo.label, feedInfo.url);
              feedData = cachedData;
            } else {
              const response = await fetch(feedInfo.url);
              if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
              }
              feedData = await response.text();

              // バリデーション
              await this.feedValidator.assertXmlFeed('fetched-feed', feedData);

              feedCache.set(feedCacheKey, feedData);
              feedCache.save();
            }

            return this.rssParser.parseString(feedData) as Promise<CustomRssParserFeed>;
          }),
        );
        if (error) {
          logger.error(
            '[fetch-feed] error',
            `${fetchProcessCounter++}/${feedInfoListLength}`,
            feedInfo.label,
            feedInfo.url,
          );
          logger.trace(error);
          return;
        }

        const postProcessedFeed = FeedCrawler.postProcessFeed(feedInfo, feed);

        // フィードのリンクの重複チェック。すでにあったらスキップ
        if (feedLinkSet.has(postProcessedFeed.link)) {
          logger.warn('フィードのリンクが重複しているのでスキップしました ', feedInfo.label, postProcessedFeed.link);
          return;
        }
        feedLinkSet.add(postProcessedFeed.link);

        feeds.push(postProcessedFeed);
        logger.info('[fetch-feed] fetched', `${fetchProcessCounter++}/${feedInfoListLength}`, feedInfo.label);
      });

    logger.info('[fetch-feed] finished');

    return feeds;
  }

  /**
   * フィード情報のチェック
   */
  public static validateFeedInfoList(feedInfoList: FeedInfo[]): void {
    const allLabels = feedInfoList.map((feedInfo) => feedInfo.label);
    const allUrls = feedInfoList.map((feedInfo) => feedInfo.url);

    const labelSet = new Set<string>();
    const urlSet = new Set<string>();

    // label の重複チェック
    for (const label of allLabels) {
      if (labelSet.has(label)) {
        throw new Error(`フィードのラベル「${label}」が重複しています`);
      }
      labelSet.add(label);
    }

    // url の重複チェック
    for (const url of allUrls) {
      if (urlSet.has(url)) {
        throw new Error(`フィードのURL「${url}」が重複しています`);
      }
      urlSet.add(url);
    }

    // url の正当性チェック
    for (const url of allUrls) {
      if (!isValidHttpUrl(url)) {
        throw new Error(`フィードのURL「${url}」が正しくありません`);
      }
    }
  }

  /**
   * 取得したフィードの調整
   */
  private static postProcessFeed(feedInfo: FeedInfo, feed: CustomRssParserFeed): CustomRssParserFeed {
    const customFeed = feed as CustomRssParserFeed;

    // ブログごとの調整
    switch (feedInfo.label) {
      case 'メルカリ':
        // 9時間ずれているので調整
        FeedCrawler.subtractFeedItemsDateHour(customFeed, 9);
        customFeed.link = 'https://engineering.mercari.com/blog/';
        break;
      case 'KAIZEN PLATFORM':
        // 9時間ずれているので調整
        FeedCrawler.subtractFeedItemsDateHour(customFeed, 9);
        break;
      case 'Tokyo Otaku Mode':
        customFeed.link = 'https://blog.otakumode.com/';
        break;
      case 'フューチャー':
        customFeed.link = 'https://future-architect.github.io/';
        break;
      case 'さくら':
        customFeed.link = 'https://knowledge.sakura.ad.jp/';
        break;
      case 'YOJO Technologies':
        customFeed.title = 'YOJO Technologies Blog';
        break;
      case 'POL':
        customFeed.title = 'POL テックノート';
        break;
      case 'mofmof':
        customFeed.link = 'https://tech.mof-mof.co.jp';
        break;
      case 'CADDi':
        customFeed.link = 'https://caddi.tech/';
        break;
    }

    if (!isValidHttpUrl(customFeed.link)) {
      logger.warn('取得したフィードのURLが正しくありません。 ', feedInfo.label, customFeed.link);
    }

    if (customFeed.items.length === 0) {
      logger.warn('取得したフィードの記事がありません', feedInfo.label);
    }

    // 全ブログの調整
    for (const feedItem of customFeed.items) {
      feedItem.link = feedItem.link || '';

      // 記事URLのクエリパラメーター削除。はてな用
      feedItem.link = urlRemoveQueryParams(feedItem.link);

      // 不正な文字列の削除
      feedItem.title = feedItem.title ? removeInvalidUnicode(feedItem.title) : '';
      feedItem.summary = feedItem.summary ? removeInvalidUnicode(feedItem.summary) : '';
      feedItem.content = feedItem.content ? removeInvalidUnicode(feedItem.content) : '';
      feedItem.contentSnippet = feedItem.contentSnippet ? removeInvalidUnicode(feedItem.contentSnippet) : '';
      feedItem.creator = feedItem.creator ? removeInvalidUnicode(feedItem.creator) : '';
      feedItem.categories = feedItem.categories?.map(removeInvalidUnicode) || [];

      // view用
      feedItem.blogTitle = customFeed.title || '';
      feedItem.blogLink = customFeed.link || '';
    }

    return customFeed;
  }

  private aggregateFeeds(feeds: CustomRssParserFeed[], aggregateFeedStartAt: Date) {
    let allFeedItems: CustomRssParserItem[] = [];
    const copiedFeeds: CustomRssParserFeed[] = objectDeepCopy(feeds);
    const aggregateFeedStartAtIsoDate = aggregateFeedStartAt.toISOString();
    const currentIsoDate = new Date().toISOString();

    for (const feed of copiedFeeds) {
      // 公開日時でフィルタ
      feed.items = feed.items.filter((feedItem) => {
        if (!feedItem.isoDate) {
          return false;
        }

        return feedItem.isoDate >= aggregateFeedStartAtIsoDate;
      });

      // 現在時刻より未来のものはフィルタ。UTC表記で日本時間設定しているブログがあるので。
      feed.items = feed.items.filter((feedItem) => {
        if (!feedItem.isoDate) {
          return false;
        }

        if (feedItem.isoDate > currentIsoDate) {
          logger.warn('[aggregate-feed] 記事の公開日時が未来になっています。', feedItem.title, feedItem.link);
          return false;
        }

        return true;
      });

      // マージ
      allFeedItems = allFeedItems.concat(feed.items);
    }

    // 日付でソート
    allFeedItems.sort((a, b) => {
      return -1 * a.isoDate.localeCompare(b.isoDate);
    });

    return allFeedItems;
  }

  private async fetchFeedItemOgObjectMap(feedItems: CustomRssParserItem[], concurrency: number): Promise<OgObjectMap> {
    const feedItemOgObjectMap: OgObjectMap = new Map();
    const feedItemsLength = feedItems.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(feedItems)
      .withConcurrency(concurrency)
      .process(async (feedItem) => {
        const [error, ogObject] = await to(
          exponentialBackoff((attemptCount: number) => {
            if (attemptCount > 0) {
              logger.warn(`[fetch-feed-item-og] retry ${feedItem.link}`);
            }

            return FeedCrawler.fetchOgObject(feedItem.link);
          }),
        );
        if (error) {
          logger.error(
            '[fetch-feed-item-og] error',
            `${fetchProcessCounter++}/${feedItemsLength}`,
            feedItem.title,
            feedItem.link,
          );
          logger.trace(error);
          return;
        }

        feedItemOgObjectMap.set(feedItem.link, ogObject);
        logger.info('[fetch-feed-item-og] fetched', `${fetchProcessCounter++}/${feedItemsLength}`, feedItem.title);
      });

    logger.info('[fetch-feed-item-og] finished');

    return feedItemOgObjectMap;
  }

  private async fetchFeedBlogOgObjectMap(feeds: CustomRssParserFeed[], concurrency: number): Promise<OgObjectMap> {
    const feedOgObjectMap: OgObjectMap = new Map();
    const feedsLength = feeds.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(feeds)
      .withConcurrency(concurrency)
      .process(async (feed) => {
        const [error, ogObject] = await to(
          exponentialBackoff((attemptCount: number) => {
            if (attemptCount > 0) {
              logger.warn(`[fetch-feed-blog-og] retry ${feed.link}`);
            }

            return FeedCrawler.fetchOgObject(feed.link);
          }),
        );
        if (error) {
          logger.error('[fetch-feed-blog-og] error', `${fetchProcessCounter++}/${feedsLength}`, feed.title, feed.link);
          logger.trace(error);
          return;
        }

        feedOgObjectMap.set(feed.link, ogObject);
        logger.info('[fetch-feed-blog-og] fetched', `${fetchProcessCounter++}/${feedsLength}`, feed.title);
      });

    logger.info('[fetch-feed-blog-og] finished');

    return feedOgObjectMap;
  }

  private static async fetchOgObject(url: string): Promise<CustomOgObject> {
    const ogObjectCacheKey = `og-object-${textToMd5Hash(url)}`;
    const ogObjectCache = flatCacheCreate({
      cacheId: ogObjectCacheKey,
      ttl: constants.fetchedOgCacheDurationInHours * 60 * 60 * 1000,
    });
    const cachedData = ogObjectCache.get<string>(ogObjectCacheKey);
    let ogObject: OgObject;

    if (cachedData) {
      logger.trace('[fetch-og] cache hit', url);
      ogObject = JSON.parse(cachedData);
    } else {
      const options: OpenGraphScraperOptions = {
        url: url,
        timeout: 10 * 1000,
        fetchOptions: {
          headers: {
            'user-agent': constants.requestUserAgent,
          },
        },
      };
      const [error, ogsResponse] = await to<{ result: OgObject }>(ogs(options));
      if (error) {
        return Promise.reject(
          new Error(`OGの取得に失敗しました。 url: ${url}`, {
            cause: error,
          }),
        );
      }

      ogObject = ogsResponse.result;

      ogObjectCache.set(ogObjectCacheKey, JSON.stringify(ogObject));
      ogObjectCache.save();
    }

    const ogImages = ogObject?.ogImage;

    const validOgImages: ImageObject[] = [];

    // データの調整しつつ、利用可能なものを取得
    if (ogImages !== undefined) {
      for (const ogImage of ogImages) {
        const ogImageUrl = ogImage.url;

        // 画像がないものはスキップ
        if (ogImageUrl == null || ogImageUrl.trim() === '') {
          continue;
        }

        // 一部URLがおかしいものの対応
        if (ogImageUrl?.startsWith('https://tech.fusic.co.jphttps')) {
          ogImage.url = ogImageUrl.substring('https://tech.fusic.co.jp'.length);
        }

        // http から始まってなければ調整
        if (ogImageUrl && !ogImageUrl.startsWith('http')) {
          ogImage.url = new URL(ogImageUrl, url).toString();
        }

        validOgImages.push(ogImage);
      }
    }

    // 画像は一つとして扱いたいのでカスタム
    const customOgObject: CustomOgObject = ogObject;
    customOgObject.customOgImage = validOgImages[0] || null;

    // faviconはフルURLにする
    if (customOgObject.favicon && !customOgObject.favicon.startsWith('http')) {
      customOgObject.favicon = new URL(customOgObject.favicon, url).toString();
    }

    return customOgObject;
  }

  private async fetchHatenaCountMap(feedItems: CustomRssParserItem[]): Promise<FeedItemHatenaCountMap> {
    const feedItemHatenaCountMap = new Map<string, number>();
    const feedItemUrlsChunks: string[][] = [];
    let feedItemCounter = 0;

    for (const feedItem of feedItems) {
      // API的に50個まで
      const chunkIndex = Math.floor(feedItemCounter / 50);

      if (!feedItemUrlsChunks[chunkIndex]) {
        feedItemUrlsChunks[chunkIndex] = [];
      }

      feedItemUrlsChunks[chunkIndex].push(feedItem.link);

      feedItemCounter++;
    }

    for (const feedItemUrls of feedItemUrlsChunks) {
      const [error, hatenaCountMap] = await to(fetchHatenaCountMap(feedItemUrls));

      if (error) {
        Promise.reject(new Error('[hatena-count] Fail to get hatena bookmark count', { cause: error }));
      }

      for (const feedItemUrl in hatenaCountMap) {
        feedItemHatenaCountMap.set(feedItemUrl, hatenaCountMap[feedItemUrl]);
      }
    }

    logger.info('[fetch-feed-item-hatena-count] fetched', feedItemHatenaCountMap);

    return feedItemHatenaCountMap;
  }

  private static subtractFeedItemsDateHour(feed: CustomRssParserFeed, subHours: number) {
    for (const feedItem of feed.items) {
      feedItem.isoDate = dayjs(feedItem.isoDate).subtract(subHours, 'h').toISOString();
      feedItem.pubDate = dayjs(feedItem.pubDate).subtract(subHours, 'h').toISOString();
    }
  }
}
