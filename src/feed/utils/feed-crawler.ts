import * as RssParser from 'rss-parser';
import { PromisePool } from '@supercharge/promise-pool';
import { FeedInfo } from '../../resources/feed-info-list';
import * as dayjs from 'dayjs';
import axios from 'axios';
import { URL } from 'url';
import * as retry from 'async-retry';
import { objectDeepCopy } from './common-util';
const ogs = require('open-graph-scraper');

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
export type RssParserFeed = RssParser.Output<RssParser.Item>;

export class FeedCrawler {
  private rssParser;

  constructor() {
    this.rssParser = new RssParser();
  }

  /**
   * フィード取得 + 取得後の調整
   */
  async fetchFeedsAsync(feedInfoList: FeedInfo[], concurrency: number): Promise<RssParserFeed[]> {
    FeedCrawler.validateFeedInfoList(feedInfoList);

    const feedInfoListLength = feedInfoList.length;
    let fetchProcessCounter = 1;

    const feeds: RssParserFeed[] = [];

    await PromisePool.for(feedInfoList)
      .withConcurrency(concurrency)
      .handleError(async (error, feedInfo) => {
        console.error('[fetch-feed] error', `${fetchProcessCounter++}/${feedInfoListLength}`, feedInfo.label);
        console.error(error);
      })
      .process(async (feedInfo) => {
        const feed = await retry(
          async () => {
            return this.rssParser.parseURL(feedInfo.url);
          },
          {
            retries: 3,
          },
        );
        const postProcessedFeed = FeedCrawler.postProcessFeed(feedInfo, feed);
        feeds.push(postProcessedFeed);
        console.log('[fetch-feed] fetched', `${fetchProcessCounter++}/${feedInfoListLength}`, feedInfo.label);
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
  private static postProcessFeed(feedInfo: FeedInfo, feed: RssParserFeed): RssParserFeed {
    // ブログごとの調整
    switch (feedInfo.label) {
      case 'メルカリ':
        // 9時間ずれているので調整
        for (const feedItem of feed.items) {
          feedItem.isoDate = dayjs(feedItem.isoDate).subtract(9, 'h').toISOString();
          feedItem.pubDate = dayjs(feedItem.pubDate).subtract(9, 'h').toISOString();
        }
        feed.link = 'https://engineering.mercari.com/blog/';
        break;
      case 'Tokyo Otaku Mode':
        feed.link = 'https://blog.otakumode.com/';
        break;
    }

    // 全ブログの調整
    for (const feedItem of feed.items) {
      // 「記事タイトル | ブログ名」の形にする
      feedItem.title = `${feedItem.title} | ${feed.title}`;
    }

    return feed;
  }

  aggregateFeeds(feeds: RssParserFeed[], filterArticleDate: Date) {
    let allFeedItems: RssParser.Item[] = [];
    const copiedFeeds: RssParserFeed[] = objectDeepCopy(feeds);
    const filterIsoDate = filterArticleDate.toISOString();

    // 公開日時でフィルタ
    for (const feed of copiedFeeds) {
      feed.items = feed.items.filter((feedItem) => {
        return feedItem.isoDate > filterIsoDate;
      });
    }

    // マージ
    for (const feed of copiedFeeds) {
      allFeedItems = allFeedItems.concat(feed.items);
    }

    // 日付でソート
    allFeedItems.sort((a, b) => {
      return -1 * a.isoDate.localeCompare(b.isoDate);
    });

    return allFeedItems;
  }

  async fetchFeedItemOgsResultMap(feedItems: RssParser.Item[], concurrency: number): Promise<OgsResultMap> {
    const feedItemOgsResultMap: OgsResultMap = new Map();
    const feedItemsLength = feedItems.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(feedItems)
      .withConcurrency(concurrency)
      .handleError(async (error, feedItem) => {
        console.error('[fetch-feed-item-ogp] error', `${fetchProcessCounter++}/${feedItemsLength}`, feedItem.title);
      })
      .process(async (feedItem) => {
        const ogsResult = await FeedCrawler.fetchOgsResult(feedItem.link);
        feedItemOgsResultMap.set(feedItem.link, ogsResult);
        console.log('[fetch-feed-item-ogp] fetched', `${fetchProcessCounter++}/${feedItemsLength}`, feedItem.title);
      });

    return feedItemOgsResultMap;
  }

  async fetchFeedOgsResultMap(feeds: RssParserFeed[], concurrency: number): Promise<OgsResultMap> {
    const feedOgsResultMap: OgsResultMap = new Map();
    const feedsLength = feeds.length;
    let fetchProcessCounter = 1;

    await PromisePool.for(feeds)
      .withConcurrency(concurrency)
      .handleError(async (error, feed) => {
        console.error('[fetch-feed-ogp] error', `${fetchProcessCounter++}/${feedsLength}`, feed.title);
      })
      .process(async (feed) => {
        const ogsResult = await FeedCrawler.fetchOgsResult(feed.link);
        feedOgsResultMap.set(feed.link, ogsResult);
        console.log('[fetch-feed-ogp] fetched', `${fetchProcessCounter++}/${feedsLength}`, feed.title);
      });

    return feedOgsResultMap;
  }

  private static async fetchOgsResult(url: string): Promise<OgsResult> {
    const ogsResponse: { result: OgsResult } = await ogs({
      url: url,
      timeout: 10 * 1000,
    });

    const ogsResult = ogsResponse.result;
    const ogImageUrl = ogsResult?.ogImage?.url;

    // http から始まってなければ調整
    if (ogImageUrl && !ogImageUrl.startsWith('http')) {
      ogsResult.ogImage.url = new URL(ogImageUrl, url).href;
    }

    return ogsResponse.result;
  }

  async fetchHatenaCountMap(feedItems: RssParser.Item[]): Promise<FeedItemHatenaCountMap> {
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

    console.log('[fetch-feed-item-hatena-count] fetched', feedItemHatenaCountMap);

    return feedItemHatenaCountMap;
  }
}
