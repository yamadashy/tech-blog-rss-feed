import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ja';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

export default async () => {
  const blogFeedsModule = await import('../blog-feeds/blog-feeds.json');
  let blogFeeds = blogFeedsModule.default;

  // データ調整
  for (const blogFeed of blogFeeds) {
    const lastUpdated = blogFeed.items[0]?.isoDate;

    if (lastUpdated) {
      blogFeed.lastUpdated = lastUpdated;
      blogFeed.diffLastUpdatedDateForHuman = dayjs().to(blogFeed.lastUpdated);
      blogFeed.lastUpdatedForHuman = dayjs(blogFeed.lastUpdated).tz().format('YYYY-MM-DD HH:mm:ss');
      blogFeed.lastUpdatedIso = new Date(blogFeed.lastUpdated).toISOString();
    }

    for (const feedItem of blogFeed.items) {
      feedItem.diffDateForHuman = dayjs().to(feedItem.isoDate);
      feedItem.pubDateForHuman = dayjs(feedItem.isoDate).format('YYYY-MM-DD HH:mm:ss');
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
