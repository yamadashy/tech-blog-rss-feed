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

    const title = feedItem.title || '';

    // 区切り文字が1つ以上なら記事タイトルとブログタイトルに分割する。独自に `|` で区切っているので
    // TODO: feed.json 作る段階で分けて入れておく
    if ((title.match(/\|/g) || []).length >= 1) {
      const splittedTitle = title.split('|');
      feedItem.title = splittedTitle.slice(0, -1).join('|') || '';
      feedItem.blogTitle = splittedTitle.slice(-1)[0] || '';
      feedItem.image = feedItem.image || 'images/icon512-transparent.png';
    }
  }

  return feedItems;
};
