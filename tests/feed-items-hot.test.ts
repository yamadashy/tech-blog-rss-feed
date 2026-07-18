import { describe, expect, it } from 'vitest';
import { dayjs } from '../src/site/_data/lib/dayjs-setup';
import { computeFeedItemsHot } from '../src/site/_data/lib/feed-items-hot';
import { makeFeedJsonItem } from './helpers/site-data-fixtures';

const NOW = dayjs('2026-07-18T12:00:00+09:00');

describe('computeFeedItemsHot', () => {
  it('はてなブックマークが3未満の item は除外する', () => {
    const items = [makeFeedJsonItem('2026-07-18T00:00:00+09:00', 3), makeFeedJsonItem('2026-07-18T00:00:00+09:00', 2)];

    const result = computeFeedItemsHot(items, NOW);

    expect(result).toHaveLength(1);
    expect(result[0]._custom.hatenaCount).toEqual(3);
  });

  it('直近1週間より古い item は除外する', () => {
    const items = [
      makeFeedJsonItem('2026-07-18T00:00:00+09:00', 10),
      makeFeedJsonItem('2026-07-01T00:00:00+09:00', 100), // 7日より前
    ];

    const result = computeFeedItemsHot(items, NOW);

    expect(result).toHaveLength(1);
    expect(result[0].date_published).toEqual('2026-07-18T00:00:00+09:00');
  });

  it('優先度（はてな数 × 新しさ）の降順で並べる', () => {
    const newAndHot = makeFeedJsonItem('2026-07-17T12:00:00+09:00', 100);
    const newAndCold = makeFeedJsonItem('2026-07-17T12:00:00+09:00', 5);
    const oldButHot = makeFeedJsonItem('2026-07-12T12:00:00+09:00', 10);

    const result = computeFeedItemsHot([newAndCold, oldButHot, newAndHot], NOW);

    expect(result.map((item) => item._custom.hatenaCount)).toEqual([100, 5, 10]);
  });

  it('priorityForSort を付与する（優先度係数の下限は 0.05）', () => {
    // 5日前の item は係数が (2/7)^3 ≈ 0.023 のため、下限の 0.05 に張り付く
    const item = makeFeedJsonItem('2026-07-13T00:00:00+09:00', 10);

    const result = computeFeedItemsHot([item], NOW);

    expect(result[0].priorityForSort).toBeCloseTo(10 * 0.05, 10);
  });

  it('item が空なら空配列を返す', () => {
    expect(computeFeedItemsHot([], NOW)).toEqual([]);
  });
});
