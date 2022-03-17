const path = require('path');
const fs = require('fs/promises');
const dayjs = require('dayjs');
require('dayjs/locale/ja');

dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

const FEED_ITEM_FILTER_DAY = 7;

module.exports = async () => {
  const feedData = JSON.parse(await fs.readFile(path.join(__dirname, '../feeds/feed.json')));

  let feedItems = feedData.items;

  // 「直近1週間分」かつ「はてなブックマークされている」
  feedItems = feedItems
    .filter((feedItem) => {
      return dayjs(feedItem.date_published) > dayjs().subtract(FEED_ITEM_FILTER_DAY, 'd');
    })
    .filter((feedItem) => {
      return feedItem._custom.hatenaCount > 0;
    });

  // データ調整
  for (const feedItem of feedItems) {
    feedItem.diffDateForHuman = dayjs().to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss');

    // ソート用の数値。日が建つほど優先度が低くなる
    const feedItemDiffDays = dayjs().tz().diff(feedItem.date_published, 'day');
    const feedItemPriorityFactor = Math.max(0.1, (FEED_ITEM_FILTER_DAY - feedItemDiffDays) / FEED_ITEM_FILTER_DAY);
    feedItem.priorityForSort = feedItem._custom.hatenaCount * feedItemPriorityFactor;
  }

  // ソート
  feedItems = feedItems.sort((a, b) => {
    return b.priorityForSort - a.priorityForSort;
  });

  return feedItems;
};
