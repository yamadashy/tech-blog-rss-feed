const path = require('node:path');
const fs = require('node:fs/promises');
const dayjs = require('dayjs');
require('dayjs/locale/ja');

dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

const FEED_ITEM_FILTER_DAY = 7;
const MIN_HATENA_BOOKMARK_AMOUNT = 3;

module.exports = async () => {
  const feedData = JSON.parse(await fs.readFile(path.join(__dirname, '../feeds/feed.json')));

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
