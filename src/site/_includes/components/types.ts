import type { BlogFeed } from '../../../feed/feed-storer';

/**
 * 全ページに固定で設定する `date`。
 *
 * `collections.all` は `date` 昇順 → `inputPath` 昇順でソートされる（sitemap の出力順に影響）。
 * 全ページで同じ `date` を指定することで、ファイルの birthtime に依存せず
 * `inputPath` 昇順の安定した順序になり、sitemap.xml / site.xml の出力が決定的になる。
 */
export const SITE_PAGE_DATE = '2020-01-01';

/**
 * Eleventy が各テンプレートに渡す `page` オブジェクトのうち、テンプレートで利用する部分。
 */
export interface EleventyPage {
  url: string;
}

/**
 * feed.json（JSON Feed 形式）の item の `_custom` 拡張フィールド。
 * @see src/feed/feed-generator.ts
 */
export interface FeedJsonItemCustom {
  hatenaCount: number;
  originalTitle: string;
  blogTitle: string;
  blogLink: string;
  blogLinkMd5Hash: string;
  favicon?: string;
}

/**
 * feed.json（JSON Feed 形式）の item。
 * `_data/feedItemsChunks.js` / `_data/feedItemsHot.js` で
 * `diffDateForHuman` などのフィールドが追加される。
 */
export interface FeedJsonItem {
  id: string;
  content_html: string;
  url: string;
  title?: string;
  summary?: string;
  image?: {
    url: string;
    alt?: string;
  };
  date_modified?: string;
  date_published?: string;
  tags?: string[];
  _custom: FeedJsonItemCustom;

  // _data で追加されるフィールド
  diffDateForHuman?: string;
  pubDateForHuman?: string;
  priorityForSort?: number;
}

/**
 * blog-feeds.json の item。
 * `BlogFeed['items']` に `_data/blogFeeds.js` で追加されるフィールドを加えたもの。
 */
export type SiteBlogFeedItem = BlogFeed['items'][number] & {
  diffDateForHuman?: string;
  pubDateForHuman?: string;
};

/**
 * blog-feeds.json の blog。
 * `BlogFeed` に `_data/blogFeeds.js` で追加されるフィールドを加えたもの。
 */
export type SiteBlogFeed = Omit<BlogFeed, 'items' | 'title'> & {
  // BlogFeed の型宣言上は string だが、フィード側にタイトルが無い場合
  // 実データ（blog-feeds.json）では null になる
  title: string | null;
  items: SiteBlogFeedItem[];
  lastUpdated?: string;
  diffLastUpdatedDateForHuman?: string;
  lastUpdatedForHuman?: string;
  lastUpdatedIso?: string;
};

/**
 * feedItemsChunks の型（日付文字列ごとにグルーピングされた feed item）。
 */
export type FeedItemsChunks = Record<string, FeedJsonItem[]>;
