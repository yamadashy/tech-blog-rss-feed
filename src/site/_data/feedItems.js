const path = require('path');
const fs = require('fs/promises');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/ja');

dayjs.extend(relativeTime);
dayjs.locale('ja');

module.exports = async () => {
  const feedData = JSON.parse(await fs.readFile(path.join(__dirname, '../feeds/feed.json')));

  let feedItems = feedData.items;

  // 直近1週間分
  feedItems = feedItems.filter((feedItem) => {
    return dayjs(feedItem.date_published) > dayjs().subtract(7, 'd');
  });

  // データ調整
  for (const feedItem of feedItems) {
    feedItem.diffDateForHuman = dayjs().to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).format('YYYY-MM-DD HH:mm:ss');
  }

  return feedItems;
};
