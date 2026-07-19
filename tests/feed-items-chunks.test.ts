import { describe, expect, it } from 'vitest';
import { dayjs } from '../src/site/_data/lib/dayjs-setup';
import { computeFeedItemsChunks } from '../src/site/_data/lib/feed-items-chunks';
import { makeFeedJsonItem } from './helpers/site-data-fixtures';

const NOW = dayjs('2026-07-18T12:00:00+09:00');

describe('computeFeedItemsChunks', () => {
  it('直近1週間より古い item は除外する', () => {
    const items = [
      makeFeedJsonItem('2026-07-18T00:00:00+09:00'),
      makeFeedJsonItem('2026-07-01T00:00:00+09:00'), // 7日より前
    ];

    const chunks = computeFeedItemsChunks(items, NOW);
    const allItems = Object.values(chunks).flat();

    expect(allItems).toHaveLength(1);
    expect(allItems[0].date_published).toEqual('2026-07-18T00:00:00+09:00');
  });

  it('公開日（M/D (dd)）ごとにグルーピングする', () => {
    const items = [
      makeFeedJsonItem('2026-07-18T09:00:00+09:00'),
      makeFeedJsonItem('2026-07-18T10:00:00+09:00'),
      makeFeedJsonItem('2026-07-17T10:00:00+09:00'),
    ];

    const chunks = computeFeedItemsChunks(items, NOW);

    expect(Object.keys(chunks)).toHaveLength(2);
    expect(chunks['7/18 (土)']).toHaveLength(2);
    expect(chunks['7/17 (金)']).toHaveLength(1);
  });

  it('対象 item に diffDateForHuman / pubDateForHuman を付与する', () => {
    const items = [makeFeedJsonItem('2026-07-17T10:00:00+09:00')];

    const chunks = computeFeedItemsChunks(items, NOW);
    const item = Object.values(chunks).flat()[0];

    expect(item.diffDateForHuman).toEqual(NOW.to('2026-07-17T10:00:00+09:00'));
    expect(item.pubDateForHuman).toEqual('2026-07-17 10:00:00');
  });

  it('date_published がない item は除外する', () => {
    const items = [
      makeFeedJsonItem('2026-07-18T00:00:00+09:00', 0, { date_published: undefined }),
      makeFeedJsonItem('2026-07-18T00:00:00+09:00'),
    ];

    const chunks = computeFeedItemsChunks(items, NOW);
    const allItems = Object.values(chunks).flat();

    expect(allItems).toHaveLength(1);
    expect(allItems[0].date_published).toEqual('2026-07-18T00:00:00+09:00');
  });

  it('item が空なら空オブジェクトを返す', () => {
    expect(computeFeedItemsChunks([], NOW)).toEqual({});
  });
});
