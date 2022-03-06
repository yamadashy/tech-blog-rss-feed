const path = require('path');
const fs = require('fs/promises');
const dayjs = require('dayjs');
require('dayjs/locale/ja');

dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

module.exports = async () => {
  const feedData = JSON.parse(await fs.readFile(path.join(__dirname, '../feeds/feed.json')));

  let feedItems = feedData.items;

  // 「直近1週間分」かつ「はてなブックマークされている」
  feedItems = feedItems
    .filter((feedItem) => {
      return dayjs(feedItem.date_published) > dayjs().subtract(7, 'd');
    })
    .filter((feedItem) => {
      return feedItem._custom.hatenaCount > 0;
    });

  // データ調整
  for (const feedItem of feedItems) {
    feedItem.diffDateForHuman = dayjs().to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss');
  }

  // はてなブックマース数順でソート
  // TODO: 単純なソートではなく新着優先しつつの人気順にしたい
  feedItems = feedItems.sort((a, b) => {
    return b._custom.hatenaCount - a._custom.hatenaCount;
  });

  return feedItems;
};
