import * as RssParser from 'rss-parser';
import { PromisePool } from '@supercharge/promise-pool';
import { FeedInfo } from '../resources/feed-info-list';

export class FeedCrawler {
  private rssParser;

  constructor() {
    this.rssParser = new RssParser();
  }

  fetchFeedsAsync(feedInfoList: FeedInfo[], concurrency: number) {
    const feedInfoListLength = feedInfoList.length;
    let fetchProcessCounter = 1;

    return PromisePool.for(feedInfoList)
      .withConcurrency(concurrency)
      .handleError(async (error, feedInfo) => {
        // TODO: リトライ処理
        console.error('[error feed info]', `${fetchProcessCounter++}/${feedInfoListLength}`, feedInfo.label);
        console.error(error);
      })
      .process(async (feedInfo) => {
        const feed = await this.rssParser.parseURL(feedInfo.url);
        console.log('[feed fetched]', `${fetchProcessCounter++}/${feedInfoListLength}`, feedInfo.label);
        return feed;
      });
  }

  /**
   * 取得したフィードの調整
   */
  public postProcessFeeds(feeds: RssParser.Output<RssParser.Item>[], filterArticleDate: Date) {
    const filterIsoDate = filterArticleDate.toISOString();

    for (const feed of feeds) {
      let feedItems = feed.items;

      // 公開日時でフィルタ
      feedItems = feedItems.filter((feedItem) => {
        // TODO: pubDate でフィルタすべきでは
        return feedItem.isoDate > filterIsoDate;
      });

      // ブログごとの調整
      switch (feed.link) {
        // 9時間ずれているので補正
        case 'https://engineering.mercari.com/blog/feed.xml':
          for (const feedItem of feedItems) {
            // TODO: dayjs 使う
            feedItem.isoDate = new Date(new Date(feedItem.isoDate).getTime() - 9 * 60 * 60 * 1000).toISOString();
            // TODO: もともとisoではないのでこの変換はおかしいかも
            feedItem.pubDate = new Date(new Date(feedItem.pubDate).getTime() - 9 * 60 * 60 * 1000).toISOString();
          }
          break;
      }

      // 全ブログの調整
      for (const feedItem of feedItems) {
        // 「記事タイトル | ブログ名」の形にする
        feedItem.title = `${feedItem.title} | ${feed.title}`;
      }

      feed.items = feedItems;
    }

    return feeds;
  }

  mergeAndSortResults(feeds: RssParser.Output<RssParser.Item>[]) {
    let allFeedItems: RssParser.Item[] = [];

    // マージ
    for (const feed of feeds) {
      allFeedItems = allFeedItems.concat(feed.items);
    }

    // 日付でソート
    allFeedItems.sort((a, b) => {
      // TODO: pubDate でソート？
      return -1 * a.isoDate.localeCompare(b.isoDate);
    });

    return allFeedItems;
  }
}
