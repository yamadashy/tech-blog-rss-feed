const siteUrlStem = 'https://yamadashy.github.io/tech-blog-rss-feed';
const siteUrl = `${siteUrlStem}/`;

module.exports = {
  // サイト設定
  siteUrl: `${siteUrl}`,
  siteUrlStem: siteUrlStem,
  siteTitle: '企業テックブログRSS',
  siteDescription:
    '企業のテックブログの更新をまとめたRSSフィードを配信しています。記事を読んでその企業の技術・カルチャーを知れることや、質の高い技術情報を得られることを目的としています。',

  // フィード設定
  feedTitle: '企業テックブログRSS',
  feedDescription: '企業のテックブログの更新をまとめたRSSフィード',
  feedLanguage: 'ja',
  feedCopyright: 'yamadashy/tech-blog-rss-feed',
  feedGenerator: 'yamadashy/tech-blog-rss-feed',
  feedUrls: {
    atom: `${siteUrl}feeds/atom.xml`,
    rss: `${siteUrl}feeds/rss.xml`,
    json: `${siteUrl}feeds/feed.json`,
  },

  // GitHub
  author: 'yamadashy',
  gitHubUserUrl: 'https://github.com/yamadashy/',
  gitHubRepositoryUrl: 'https://github.com/yamadashy/tech-blog-rss-feed/',

  // Google Analytics系。フォークして使う際は値を空にするか書き換えてください
  googleSiteVerification: 'GPLvXv8kYtLMW912ZS54DKFEZL6ruOrjOFLdHVTo37o',
  globalSiteTagKey: 'G-CNNNTL0NB3',

  // フィードの取得などに使う UserAgent
  requestUserAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
};
