import { describe, expect, it } from 'vitest';
import { computeLastModifiedBlogsDate } from '../src/site/_data/lib/last-modified-blogs-date';
import { makeFeedJsonItem } from './helpers/site-data-fixtures';

describe('computeLastModifiedBlogsDate', () => {
  it('先頭 item の date_published を ISO 文字列で返す', () => {
    const items = [makeFeedJsonItem('2026-07-18T09:00:00+09:00'), makeFeedJsonItem('2026-07-17T09:00:00+09:00')];

    expect(computeLastModifiedBlogsDate(items)).toEqual('2026-07-18T00:00:00.000Z');
  });

  it('item が空なら feed.json が空である旨のエラーを投げる', () => {
    expect(() => computeLastModifiedBlogsDate([])).toThrowError(/feed\.json/);
  });

  it('先頭 item の date_published が undefined ならエラーを投げる', () => {
    const items = [makeFeedJsonItem('2026-07-18T09:00:00+09:00', 0, { date_published: undefined })];

    expect(() => computeLastModifiedBlogsDate(items)).toThrowError(/date_published/);
  });

  it('先頭 item の date_published が不正な日付文字列ならエラーを投げる', () => {
    const items = [makeFeedJsonItem('2026-07-18T09:00:00+09:00', 0, { date_published: 'not-a-date' })];

    expect(() => computeLastModifiedBlogsDate(items)).toThrowError(/date_published/);
  });
});
