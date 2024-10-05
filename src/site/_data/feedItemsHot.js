import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

const FEED_ITEM_FILTER_DAY = 7;
const MIN_HATENA_BOOKMARK_AMOUNT = 3;

export default async () => {
  const feedDataModule = await import('../feeds/feed.json');
  const feedData = feedDataModule.default;

  let feedItems = feedData.items;

  // 「直近1週間分」かつ「3つ以上はてなブックマークされている」
  feedItems = feedItems
    .filter((feedItem) => {
      return dayjs(feedItem.date_published) > dayjs().subtract(FEED_ITEM_FILTER_DAY, 'd');
    })
    .filter((feedItem) => {
      return feedItem._custom.hatenaCount >= MIN_HATENA_BOOKMARK_AMOUNT;
    });

  // データ調整
  for (const feedItem of feedItems) {
    feedItem.diffDateForHuman = dayjs().to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss');

    // ソート用の数値。日が建つほど優先度が低くなる
    const feedItemDiffDays = dayjs().tz().diff(feedItem.date_published, 'day');
    const feedItemPriorityFactor = Math.max(
      0.05,
      ((FEED_ITEM_FILTER_DAY - feedItemDiffDays) / FEED_ITEM_FILTER_DAY) ** 3,
    );
    feedItem.priorityForSort = feedItem._custom.hatenaCount * feedItemPriorityFactor;
  }

  // ソート
  feedItems = feedItems.sort((a, b) => {
    return b.priorityForSort - a.priorityForSort;
  });

  return feedItems;
};
