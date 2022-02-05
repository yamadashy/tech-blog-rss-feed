import * as RssParser from 'rss-parser';
import { Feed, FeedOptions } from 'feed';

const SITE_URL = 'https://yamadashy.github.io/tech-blog-rss-feed';

export class FeedGenerator {
  generateFeed(feedItems: RssParser.Item[], maxFeedDescriptionLength: number, maxFeedContentLength: number) {
    // TODO: オプション確認
    // TODO: RSSバリデーターかける
    const outputFeed = new Feed({
      title: '企業テックブログRSSフィード',
      description: '企業のテックブログのRSSフィードをまとめたフィード',
      language: 'ja',
      // TODO: リンク正しく
      link: `${SITE_URL}/`,
      feedLinks: {
        rss: `${SITE_URL}/feed/rss.xml`,
        atom: `${SITE_URL}/feed/atom.xml`,
        json: `${SITE_URL}/feed/feed.json`,
      },
      image: `${SITE_URL}/images/icon.png`,
      favicon: `${SITE_URL}/images/favicon.ico`,
      copyright: 'yamadashy/tech-blog-rss-feed',
      generator: 'yamadashy/tech-blog-rss-feed',
      // TODO: 最新のフィードの日時にする？
      updated: new Date(),
      // TODO
      // hub?: string;
      // docs?: string;
      // ttl
      // id
    } as FeedOptions);

    for (const feedItem of feedItems) {
      console.log('[article]', feedItem.isoDate, feedItem.title);

      // 改行などを変換
      const feedContent = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');

      // TODO: オプション確認
      // TODO: imageとか対応できるならしたい
      outputFeed.addItem({
        id: feedItem.guid,
        guid: feedItem.guid,
        // extensions,
        title: feedItem.title,
        description: this.truncateText(feedContent, maxFeedDescriptionLength, '...'),
        // TODO: Feedlyでいい感じに見えるか確認
        content: this.truncateText(feedContent, maxFeedContentLength, '...'),
        link: feedItem.link,
        category: (feedItem.categories || []).map((category) => {
          return {
            name: category,
          };
        }),
        // TODO: author情報も取得して入れる。creator ?
        // author: [],
        published: feedItem.isoDate ? new Date(feedItem.isoDate) : null,
        date: feedItem.isoDate ? new Date(feedItem.isoDate) : null,
      });
    }

    return outputFeed;
  }

  truncateText(text: string, maxLength: number, postFix: string): string {
    return text.length > maxLength ? text.substring(0, maxLength) + postFix : text;
  }
}
