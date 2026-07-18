import type { FeedJsonItem } from '../../_includes/components/types';

/**
 * feed.json の先頭 item の公開日時を、最終更新日時（ISO 文字列）として返す。
 *
 * feed.json は公開日時の降順で並んでいる前提のため、先頭 item が最新となる。
 * item が 1 件も無い場合は原因が分かるエラーを投げる（元の `_data/lastModifiedBlogsDate.js`
 * では `items[0].date_published` に無防備にアクセスしており、空の feed.json だと
 * 不親切な TypeError でビルド全体が落ちていた）。
 *
 * @param feedItems feed.json の items
 */
export const computeLastModifiedBlogsDate = (feedItems: FeedJsonItem[]): string => {
  const latestFeedItem = feedItems[0];

  if (!latestFeedItem) {
    throw new Error(
      'feed.json に item が 1 件も存在しないため lastModifiedBlogsDate を算出できません。' +
        'feed-generate が正常に完了し、feed.json に item が含まれているか確認してください。',
    );
  }

  return new Date(latestFeedItem.date_published as string).toISOString();
};
