import RssParser from 'rss-parser';
import { PromisePool } from '@supercharge/promise-pool';
import { FeedInfo } from '../../resources/feed-info-list';
import dayjs from 'dayjs';
import axios from 'axios';
import { URL } from 'url';
import { backoff, isValidHttpUrl, objectDeepCopy, urlRemoveQueryParams } from './common-util';
import { logger } from './logger';
import constants from '../../common/constants';
const ogs = require('open-graph-scraper');
const Cache = require('@11ty/eleventy-cache-assets');

export type OgsResult = {
  ogTitle: string;
  ogType: string;
  ogUrl: string;
  ogDescription: string;
  favicon: string;
  requestUrl: string;
  ogImage: {
    url: string;
    width: string;
    height: string;
    type: string;
  };
};
export type OgsResultMap = Map<string, OgsResult>;
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

export class FeedCrawler {
  private rssParser;

  constructor() {
    this.rssParser = new RssParser();
  }

  /**
   * フィード取得 + 取得後の調整
   */
  async fetchFeedsAsync(feedInfoList: FeedInfo[], concurrency: number): Promise<CustomRssParserFeed[]> {
    FeedCrawler.validateFeedInfoList(feedInfoList);

    const feedInfoListLength = feedInfoList.length;
    let fetchProcessCounter = 1;

    const feeds: CustomRssParserFeed[] = [];

    await PromisePool.for(feedInfoList)
      .withConcurrency(concurrency)
      .handleError(async (error, feedInfo) => {
        logger.error(
          '[fetch-feed] error',
          `${fetchProcessCounter++}/${feedInfoListLength}`,
          feedInfo.label,
          feedInfo.url,
        );
        logger.trace(error);
      })
      .process(async (feedInfo) => {
        const feed = await backoff(async () => {
          return this.rssParser.parseURL(feedInfo.url) as Promise<CustomRssParserFeed>;
        });
        const postProcessedFeed = FeedCrawler.postProcessFeed(feedInfo, feed);
        feeds.push(postProcessedFeed);
        logger.info('[fetch-feed] fetched', `${fetchProcessCounter++}/${feedInfoListLength}`, feedInfo.label);
      });

    return feeds;
  }

  /**
   * フィード情報のチェック
   */
  public static validateFeedInfoList(feedInfoList: FeedInfo[]) {
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
  }

  /**
   * 取得したフィードの調整
   */
  private static postProcessFeed(feedInfo: FeedInfo, feed: RssParser.Output<RssParser.Item>): CustomRssParserFeed {
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
    }

    if (!isValidHttpUrl(customFeed.link)) {
      logger.warn('取得したフィードのURLが正しくありません。 ', feedInfo.label, customFeed.link);
    }

    if (customFeed.items.length === 0) {
      logger.warn('取得したフィードの記事ががありません', feedInfo.label);
    }

    // 全ブログの調整
    for (const feedItem of customFeed.items) {
      feedItem.link = feedItem.link || '';

      // 記事URLのクエリパラメーター削除
      feedItem.link = urlRemoveQueryParams(feedItem.link);

      // view用
      feedItem.blogTitle = feed.title || '';
      feedItem.blogLink = feed.link || '';
    }

    return customFeed;
  }

  aggregateFeeds(feeds: CustomRssParserFeed[], filterArticleDate: Date) {
    let allFeedItems: CustomRssParserItem[] = [];
    const copiedFeeds: CustomRssParserFeed[] = objectDeepCopy(feeds);
    const filterIsoDate = filterArticleDate.toISOString();
    const currentIsoDate = new Date().toISOString();

    for (const feed of copiedFeeds) {
      // 公開日時でフィルタ
      feed.items = feed.items.filter((feedItem) => {
        if (!feedItem.isoDate) {
          return false;
        }

        return feedItem.isoDate >= filterIsoDate;
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

  async fetchFeedItemOgsResultMap(feedItems: CustomRssParserItem[], concurrency: number): Promise<OgsResultMap> {
    const feedItemOgsResultMap: OgsResultMap = new Map();
    const feedItemsLength = feedItems.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(feedItems)
      .withConcurrency(concurrency)
      .handleError(async (error, feedItem) => {
        logger.error(
          '[fetch-feed-item-ogp] error',
          `${fetchProcessCounter++}/${feedItemsLength}`,
          feedItem.title,
          feedItem.link,
        );
        logger.trace(error);
      })
      .process(async (feedItem) => {
        const ogsResult = await backoff(async () => {
          return FeedCrawler.fetchOgsResult(feedItem.link);
        });
        feedItemOgsResultMap.set(feedItem.link, ogsResult);
        logger.info('[fetch-feed-item-ogp] fetched', `${fetchProcessCounter++}/${feedItemsLength}`, feedItem.title);
      });

    return feedItemOgsResultMap;
  }

  async fetchFeedOgsResultMap(feeds: CustomRssParserFeed[], concurrency: number): Promise<OgsResultMap> {
    const feedOgsResultMap: OgsResultMap = new Map();
    const feedsLength = feeds.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(feeds)
      .withConcurrency(concurrency)
      .handleError(async (error, feed) => {
        logger.error('[fetch-feed-ogp] error', `${fetchProcessCounter++}/${feedsLength}`, feed.title, feed.link);
        logger.trace(error);
      })
      .process(async (feed) => {
        const ogsResult = await backoff(async () => {
          return FeedCrawler.fetchOgsResult(feed.link);
        });
        feedOgsResultMap.set(feed.link, ogsResult);
        logger.info('[fetch-feed-ogp] fetched', `${fetchProcessCounter++}/${feedsLength}`, feed.title);
      });

    return feedOgsResultMap;
  }

  private static async fetchOgsResult(url: string): Promise<OgsResult> {
    const ogsResponse: { result: OgsResult } = await ogs({
      url: url,
      timeout: 60 * 1000,
      // 10MB
      downloadLimit: 10 * 1000 * 1000,
      headers: {
        'user-agent': constants.requestUserAgent,
      },
    });

    const ogsResult = ogsResponse.result;
    const ogImageUrl = ogsResult?.ogImage?.url;

    // 一部URLがおかしいものの対応
    if (ogImageUrl && ogImageUrl.startsWith('https://tech.fusic.co.jphttps')) {
      ogsResult.ogImage.url = ogImageUrl.substring('https://tech.fusic.co.jp'.length);
    }

    // http から始まってなければ調整
    if (ogImageUrl && !ogImageUrl.startsWith('http')) {
      ogsResult.ogImage.url = new URL(ogImageUrl, url).toString();
    }

    return ogsResponse.result;
  }

  async fetchHatenaCountMap(feedItems: CustomRssParserItem[]): Promise<FeedItemHatenaCountMap> {
    const feedItemHatenaCountMap: Map<string, number> = new Map();
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
      const params = feedItemUrls.map((url) => `url=${url}`).join('&');
      const response = await axios.get(`https://bookmark.hatenaapis.com/count/entries?${params}`);
      const hatenaCountMap: { [key: string]: number } = response.data;

      for (const feedItemUrl in response.data) {
        feedItemHatenaCountMap.set(feedItemUrl, hatenaCountMap[feedItemUrl]);
      }
    }

    logger.info('[fetch-feed-item-hatena-count] fetched', feedItemHatenaCountMap);

    return feedItemHatenaCountMap;
  }

  async fetchAndCacheOgImages(
    allFeedItems: CustomRssParserItem[],
    ogsResultMap: OgsResultMap,
    feeds: CustomRssParserFeed[],
    concurrency: number,
  ): Promise<void> {
    let ogImageUrls: string[] = [];

    for (const feedItem of allFeedItems) {
      ogImageUrls.push(ogsResultMap.get(feedItem.link)?.ogImage?.url || '');
    }

    for (const feed of feeds) {
      ogImageUrls.push(ogsResultMap.get(feed.link)?.ogImage?.url || '');
    }

    // フィルタ
    ogImageUrls = ogImageUrls.filter(Boolean);

    // 画像取得
    const ogImageUrlsLength = ogImageUrls.length;
    let fetchProcessCounter = 1;

    Cache.concurrency = concurrency;

    await PromisePool.for(ogImageUrls)
      .withConcurrency(concurrency)
      .handleError(async (error, ogImageUrl) => {
        logger.error('[cache-image] error', `${fetchProcessCounter++}/${ogImageUrlsLength}`, ogImageUrl);
        logger.trace(error);
      })
      .process(async (ogImageUrl) => {
        await Cache(ogImageUrl, {
          duration: '3d',
          type: 'buffer',
          fetchOptions: {
            headers: {
              'user-agent': constants.requestUserAgent,
            },
          },
        });
        logger.info('[cache-image] fetched', `${fetchProcessCounter++}/${ogImageUrlsLength}`, ogImageUrl);
      });
  }

  private static subtractFeedItemsDateHour(feed: CustomRssParserFeed, subHours: number) {
    for (const feedItem of feed.items) {
      feedItem.isoDate = dayjs(feedItem.isoDate).subtract(subHours, 'h').toISOString();
      feedItem.pubDate = dayjs(feedItem.pubDate).subtract(subHours, 'h').toISOString();
    }
  }
}
