import { describe, expect, it } from 'vitest';
import { decorateBlogFeeds } from '../src/site/_data/lib/blog-feeds';
import { dayjs } from '../src/site/_data/lib/dayjs-setup';
import { makeBlogFeed, makeBlogFeedItem } from './helpers/site-data-fixtures';

const NOW = dayjs('2026-07-18T12:00:00+09:00');

describe('decorateBlogFeeds', () => {
  it('最終更新日時の降順で並べ、更新日時なし（item が空）のブログは末尾にする', () => {
    const blogFeeds = [
      makeBlogFeed('old', [makeBlogFeedItem('2026-07-10T00:00:00Z')]),
      makeBlogFeed('empty', []),
      makeBlogFeed('new', [makeBlogFeedItem('2026-07-18T00:00:00Z')]),
    ];

    const result = decorateBlogFeeds(blogFeeds, NOW);

    expect(result.map((blogFeed) => blogFeed.title)).toEqual(['new', 'old', 'empty']);
  });

  it('先頭 item の isoDate から最終更新日時フィールドを付与する', () => {
    const iso = '2026-07-18T00:00:00Z';
    const blogFeeds = [makeBlogFeed('blog', [makeBlogFeedItem(iso)])];

    const [result] = decorateBlogFeeds(blogFeeds, NOW);

    expect(result.lastUpdated).toEqual(iso);
    expect(result.diffLastUpdatedDateForHuman).toEqual(NOW.to(iso));
    expect(result.lastUpdatedForHuman).toEqual(dayjs(iso).tz().format('YYYY-MM-DD HH:mm:ss'));
    expect(result.lastUpdatedIso).toEqual(new Date(iso).toISOString());
  });

  it('item が空のブログには最終更新日時フィールドを付与しない', () => {
    const blogFeeds = [makeBlogFeed('empty', [])];

    const [result] = decorateBlogFeeds(blogFeeds, NOW);

    expect(result.lastUpdated).toBeUndefined();
    expect(result.lastUpdatedForHuman).toBeUndefined();
    expect(result.lastUpdatedIso).toBeUndefined();
  });

  it('各 item に diffDateForHuman / pubDateForHuman を付与する（pubDateForHuman はデフォルト tz に固定）', () => {
    const iso = '2026-07-18T00:00:00Z';
    const blogFeeds = [makeBlogFeed('blog', [makeBlogFeedItem(iso)])];

    const [result] = decorateBlogFeeds(blogFeeds, NOW);
    const item = result.items[0];

    expect(item.diffDateForHuman).toEqual(NOW.to(iso));
    // lastUpdatedForHuman と同様に、item の pubDateForHuman も .tz() で
    // デフォルトタイムゾーンに固定する（ビルドマシンの tz に依存しない）
    expect(item.pubDateForHuman).toEqual(dayjs(iso).tz().format('YYYY-MM-DD HH:mm:ss'));
  });

  it('ブログが空なら空配列を返す', () => {
    expect(decorateBlogFeeds([], NOW)).toEqual([]);
  });
});
