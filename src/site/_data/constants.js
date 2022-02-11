const siteUrl = 'https://yamadashy.github.io/tech-blog-rss-feed/';

module.exports = {
  author: 'yamadashy',
  siteUrl: `${siteUrl}`,
  siteTitle: '企業テックブログRSS',
  siteDescription:
    '企業のテックブログの更新をまとめたRSSフィードを配信しています。記事を読んでその企業の技術・カルチャーを知れることや、質の高い技術情報を得られることを目的としています。',
  gitHubUserUrl: 'https://github.com/yamadashy/',
  gitHubRepositoryUrl: 'https://github.com/yamadashy/tech-blog-rss-feed/',
  feedUrls: {
    atom: `${siteUrl}feeds/atom.xml`,
    rss: `${siteUrl}feeds/rss.xml`,
    json: `${siteUrl}feeds/feed.json`,
  },
  // Google Search Console 用
  googleSiteVerification: 'GPLvXv8kYtLMW912ZS54DKFEZL6ruOrjOFLdHVTo37o',
};
