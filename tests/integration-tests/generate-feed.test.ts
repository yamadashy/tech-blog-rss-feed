import { FEED_INFO_LIST } from '../../src/resources/feed-info-list';
import { FeedCrawler } from '../../src/feed/utils/feed-crawler';
import { FeedGenerator } from '../../src/feed/utils/feed-generator';
import { describe, it, expect } from 'vitest';

const FEED_FETCH_CONCURRENCY = 50;
const FEED_OG_FETCH_CONCURRENCY = 20;
const FILTER_ARTICLE_DATE = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const MAX_FEED_DESCRIPTION_LENGTH = 200;
const MAX_FEED_CONTENT_LENGTH = 500;

const feedCrawler = new FeedCrawler();
const feedGenerator = new FeedGenerator();

describe('フィード生成', async () => {
  it('フィードを正しく生成できるか', async () => {
    // 10個適当に取得
    const shuffledFeedInfoList = FEED_INFO_LIST.sort(() => 0.5 - Math.random());
    const feedInfoList = shuffledFeedInfoList.slice(0, 10);

    // フィード取得
    const crawlFeedsResult = await feedCrawler.crawlFeeds(
      feedInfoList,
      FEED_FETCH_CONCURRENCY,
      FEED_OG_FETCH_CONCURRENCY,
      FILTER_ARTICLE_DATE,
    );

    // まとめフィード作成
    const ogObjectMap = new Map([...crawlFeedsResult.feedItemOgObjectMap, ...crawlFeedsResult.feedBlogOgObjectMap]);
    const generateFeedsResult = feedGenerator.generateFeeds(
      crawlFeedsResult.feedItems,
      ogObjectMap,
      crawlFeedsResult.feedItemHatenaCountMap,
      MAX_FEED_DESCRIPTION_LENGTH,
      MAX_FEED_CONTENT_LENGTH,
    );

    // 一つでもimageがあればok
    let isImageFound = false;
    for (const item of generateFeedsResult.aggregatedFeed.items) {
      if (item.image) {
        isImageFound = true;
        break;
      }
    }
    expect(isImageFound).toBeTruthy();
  });
});
