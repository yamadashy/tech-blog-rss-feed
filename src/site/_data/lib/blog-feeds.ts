import type { SiteBlogFeed } from '../../_includes/components/types';
import { type Dayjs, dayjs } from './dayjs-setup';

/**
 * blog-feeds.json の各ブログに最終更新日時などの表示用フィールドを付与し、
 * 最終更新日時の降順（更新日時なしは末尾）でソートする。
 *
 * 元の `_data/blogFeeds.js` と同じく、ブログおよびその item を破壊的に変更する。
 * item の `pubDateForHuman` は（`lastUpdatedForHuman` とは異なり）意図的に `.tz()` を付けずに
 * フォーマットしている点に注意（元実装の挙動を維持している）。
 *
 * @param blogFeeds blog-feeds.json（この配列と要素は変更される）
 * @param now 現在時刻（`dayjs()` を注入。テスト時は固定値を渡せる）
 */
export const decorateBlogFeeds = (blogFeeds: SiteBlogFeed[], now: Dayjs): SiteBlogFeed[] => {
  // データ調整
  for (const blogFeed of blogFeeds) {
    const lastUpdated = blogFeed.items[0]?.isoDate;

    if (lastUpdated) {
      blogFeed.lastUpdated = lastUpdated;
      blogFeed.diffLastUpdatedDateForHuman = now.to(blogFeed.lastUpdated);
      blogFeed.lastUpdatedForHuman = dayjs(blogFeed.lastUpdated).tz().format('YYYY-MM-DD HH:mm:ss');
      blogFeed.lastUpdatedIso = new Date(blogFeed.lastUpdated).toISOString();
    }

    for (const feedItem of blogFeed.items) {
      feedItem.diffDateForHuman = now.to(feedItem.isoDate);
      feedItem.pubDateForHuman = dayjs(feedItem.isoDate).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  // ソート
  return blogFeeds.sort((a, b) => {
    if (!a.lastUpdated) {
      return 1;
    }
    if (!b.lastUpdated) {
      return -1;
    }

    return -1 * a.lastUpdated.localeCompare(b.lastUpdated);
  });
};
