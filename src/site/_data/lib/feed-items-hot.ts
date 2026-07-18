import type { FeedJsonItem } from '../../_includes/components/types';
import { type Dayjs, dayjs } from './dayjs-setup';

/** 何日前までのフィードを対象にするか。 */
const FEED_ITEM_FILTER_DAY = 7;
/** 人気フィードとして扱う最小はてなブックマーク数。 */
const MIN_HATENA_BOOKMARK_AMOUNT = 3;

/**
 * feed.json の item を「直近 1 週間分」かつ「3 つ以上はてなブックマークされている」もので絞り込み、
 * はてなブックマーク数と経過日数から算出した優先度で降順ソートする。
 *
 * 元の `_data/feedItemsHot.js` と同じく、対象 item に対して
 * `diffDateForHuman` / `pubDateForHuman` / `priorityForSort` を破壊的に追加する。
 *
 * @param feedItems feed.json の items（この配列内の item オブジェクトは変更される）
 * @param now 現在時刻（`dayjs()` を注入。テスト時は固定値を渡せる）
 */
export const computeFeedItemsHot = (feedItems: FeedJsonItem[], now: Dayjs): FeedJsonItem[] => {
  // 「直近1週間分」かつ「3つ以上はてなブックマークされている」
  const filteredFeedItems = feedItems
    .filter((feedItem) => {
      return dayjs(feedItem.date_published) > now.subtract(FEED_ITEM_FILTER_DAY, 'd');
    })
    .filter((feedItem) => {
      return feedItem._custom.hatenaCount >= MIN_HATENA_BOOKMARK_AMOUNT;
    });

  // データ調整
  for (const feedItem of filteredFeedItems) {
    feedItem.diffDateForHuman = now.to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss');

    // ソート用の数値。日が建つほど優先度が低くなる
    const feedItemDiffDays = now.tz().diff(feedItem.date_published, 'day');
    const feedItemPriorityFactor = Math.max(
      0.05,
      ((FEED_ITEM_FILTER_DAY - feedItemDiffDays) / FEED_ITEM_FILTER_DAY) ** 3,
    );
    feedItem.priorityForSort = feedItem._custom.hatenaCount * feedItemPriorityFactor;
  }

  // ソート
  return filteredFeedItems.sort((a, b) => {
    return (b.priorityForSort ?? 0) - (a.priorityForSort ?? 0);
  });
};
