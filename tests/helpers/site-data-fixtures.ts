import type { FeedJsonItem, SiteBlogFeed, SiteBlogFeedItem } from '../../src/site/_includes/components/types';

/**
 * feed.json の item（FeedJsonItem）のテスト用ファクトリ。
 * 必須フィールドを埋めつつ、date_published と hatenaCount を指定できる。
 */
export const makeFeedJsonItem = (
  datePublished: string,
  hatenaCount = 0,
  overrides: Partial<FeedJsonItem> = {},
): FeedJsonItem => ({
  id: `https://example.com/${datePublished}`,
  content_html: '記事本文',
  url: `https://example.com/${datePublished}`,
  title: '記事タイトル',
  date_published: datePublished,
  _custom: {
    hatenaCount,
    originalTitle: '記事タイトル',
    blogTitle: 'テストブログ',
    blogLink: 'https://example.com',
    blogLinkMd5Hash: 'dummyhash',
  },
  ...overrides,
});

/**
 * blog-feeds.json の item（SiteBlogFeedItem）のテスト用ファクトリ。
 */
export const makeBlogFeedItem = (isoDate: string, overrides: Partial<SiteBlogFeedItem> = {}): SiteBlogFeedItem => ({
  title: '記事タイトル',
  link: 'https://example.com/article',
  summary: '概要',
  content_html: '記事本文',
  isoDate,
  hatenaCount: 0,
  ogImageUrl: '',
  ...overrides,
});

/**
 * blog-feeds.json の blog（SiteBlogFeed）のテスト用ファクトリ。
 */
export const makeBlogFeed = (
  title: string,
  items: SiteBlogFeedItem[],
  overrides: Partial<SiteBlogFeed> = {},
): SiteBlogFeed => ({
  title,
  link: `https://example.com/${title}`,
  linkMd5Hash: `hash-${title}`,
  ogImageUrl: '',
  ogDescription: '説明',
  items,
  ...overrides,
});
