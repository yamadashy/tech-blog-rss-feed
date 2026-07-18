import type { FeedItemsChunks, FeedJsonItem } from '../../_includes/components/types';
import { type Dayjs, dayjs } from './dayjs-setup';

/** 何日前までのフィードを対象にするか。 */
const FEED_ITEM_FILTER_DAY = 7;

/**
 * feed.json の item を「直近 1 週間分」に絞り込み、日付文字列ごとにグルーピングする。
 *
 * 元の `_data/feedItemsChunks.js` と同じく、対象 item に対して
 * `diffDateForHuman` / `pubDateForHuman` を破壊的に追加する。
 *
 * @param feedItems feed.json の items（この配列内の item オブジェクトは変更される）
 * @param now 現在時刻（`dayjs()` を注入。テスト時は固定値を渡せる）
 */
export const computeFeedItemsChunks = (feedItems: FeedJsonItem[], now: Dayjs): FeedItemsChunks => {
  // 直近1週間分
  const filteredFeedItems = feedItems.filter((feedItem) => {
    return dayjs(feedItem.date_published) > now.subtract(FEED_ITEM_FILTER_DAY, 'd');
  });

  // データ調整
  for (const feedItem of filteredFeedItems) {
    feedItem.diffDateForHuman = now.to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss');
  }

  const feedItemsChunks: FeedItemsChunks = {};

  for (const feedItem of filteredFeedItems) {
    const dateString = dayjs(feedItem.date_published).tz().format('M/D (dd)');

    if (!feedItemsChunks[dateString]) {
      feedItemsChunks[dateString] = [];
    }

    feedItemsChunks[dateString].push(feedItem);
  }

  return feedItemsChunks;
};
