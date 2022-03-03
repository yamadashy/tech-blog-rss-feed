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
  let blogFeeds = JSON.parse(await fs.readFile(path.join(__dirname, '../blog-feeds/blog-feeds.json')));

  for (const blogFeed of blogFeeds) {
    let lastUpdated = blogFeed.items[0]?.isoDate;

    if (lastUpdated) {
      blogFeed.lastUpdated = lastUpdated;
      blogFeed.diffLastUpdatedDateForHuman = dayjs().to(blogFeed.lastUpdated);
      blogFeed.lastUpdatedForHuman = dayjs(blogFeed.lastUpdated).tz().format('YYYY-MM-DD HH:mm:ss');
      blogFeed.lastUpdatedIso = new Date(blogFeed.lastUpdated).toISOString();
    }

    // データ調整
    // TODO: このあたりのjsonを保存したときにやりたい
    for (const feedItem of blogFeed.items) {
      feedItem.diffDateForHuman = dayjs().to(feedItem.isoDate);
      feedItem.pubDateForHuman = dayjs(feedItem.isoDate).format('YYYY-MM-DD HH:mm:ss');

      const title = feedItem.title || '';

      // 区切り文字が1つ以上なら記事タイトルとブログタイトルに分割する。独自に `|` で区切っているので
      // TODO: feed.json 作る段階で分けて入れておく
      if ((title.match(/\|/g) || []).length >= 1) {
        const splittedTitle = title.split('|');
        feedItem.title = splittedTitle.slice(0, -1).join('|') || '';
        feedItem.blogTitle = splittedTitle.slice(-1)[0] || '';
      }
    }
  }

  // ソート
  blogFeeds = blogFeeds.sort((a, b) => {
    if (!a.lastUpdated) {
      return 1;
    }
    if (!b.lastUpdated) {
      return -1;
    }

    return -1 * a.lastUpdated.localeCompare(b.lastUpdated);
  });

  return blogFeeds;
};
