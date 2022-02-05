import { FEED_INFO_LIST, FeedInfo } from '../resources/feed-info-list';
import * as RssParser from 'rss-parser';
import { PromisePool } from '@supercharge/promise-pool';
import * as fs from 'fs/promises';

(async () => {
  const rssParser = new RssParser();
  const feedTuples: [FeedInfo, RssParser.Output<RssParser.Item>][] = [];

  // データ取得
  await PromisePool.for(FEED_INFO_LIST)
    .withConcurrency(20)
    .handleError(async (error, feedInfo) => {
      console.error('[error feed info]', feedInfo.label);
      console.error(error);
    })
    .process(async (feedInfo) => {
      const feed = await rssParser.parseURL(feedInfo.url);
      console.log('[fetched]', feedInfo.label);
      feedTuples.push([feedInfo, feed]);
    });

  // ファイル出力
  let tableRowHtml = '';

  feedTuples.forEach(([feedInfo, feed]) => {
    const lastModifiedDate = feed.items[0]?.isoDate ? new Date(feed.items[0].isoDate).toLocaleDateString() : null;
    tableRowHtml += `
      <tr>
        <td>${feedInfo.label}</td>
        <td>${feed.title}</td>
        <td><a href="${feed.link}">${feed.link}</a></td>
        <td><a href="${feedInfo.url}">${feedInfo.url}</a></td>
        <td>${lastModifiedDate}</td>
      </tr>
    `;
  });

  await fs.mkdir('storage', {
    recursive: true,
  });
  await fs.writeFile(
    'storage/check.html',
    `
    <link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">
    <table>${tableRowHtml}</table>
  `,
  );
})();
