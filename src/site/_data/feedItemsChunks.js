const path = require('node:path');
const fs = require('node:fs/promises');
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

  // 直近1週間分
  feedItems = feedItems.filter((feedItem) => {
    return dayjs(feedItem.date_published) > dayjs().subtract(7, 'd');
  });

  // データ調整
  for (const feedItem of feedItems) {
    feedItem.diffDateForHuman = dayjs().to(feedItem.date_published);
    feedItem.pubDateForHuman = dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss');
  }

  const feedItemsChunks = {};

  for (const feedItem of feedItems) {
    const dateString = dayjs(feedItem.date_published).tz().format('M/D (dd)');

    if (!feedItemsChunks[dateString]) {
      feedItemsChunks[dateString] = [];
    }

    feedItemsChunks[dateString].push(feedItem);
  }

  return feedItemsChunks;
};
