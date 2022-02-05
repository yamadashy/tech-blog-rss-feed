export type FeedInfo = {
  label: string;
  url: string;
};

const createFeedInfoList = (feedInfoTuples: [label: string, url: string][]) => {
  const feedInfoList: FeedInfo[] = [];

  for (const [label, url] of feedInfoTuples) {
    feedInfoList.push({ label, url });
  }

  return feedInfoList;
};

// フィード情報一覧。アルファベット順
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  // ['企業名・製品名など', 'RSS/AtomフィードのURL'],
  ['ABEJA', 'https://tech-blog.abeja.asia/feed'],
  ['ANDPAD', 'https://tech.andpad.co.jp/feed'],
  ['CADDi', 'https://caddi.tech/feed'],
  ['DMM', 'https://inside.dmm.com/feed'],
  ['DeNA', 'https://engineering.dena.com/blog/index.xml'],
  ['GMOアドパートナーズ', 'https://techblog.gmo-ap.jp/feed/'],
  ['GMOペパボ', 'https://tech.pepabo.com/feed.xml'],
  ['GMOメディア', 'https://blog.gmo.media/feed/atom/'],
  ['GREE', 'https://labs.gree.jp/blog/feed/'],
  ['ぐるなび', 'https://developers.gnavi.co.jp/feed'],
  ['はてな', 'https://developer.hatenastaff.com/feed'],
  ['カミナシ', 'https://kaminashi-developer.hatenablog.jp/feed'],
  ['カヤック', 'https://techblog.kayac.com/feed'],
  ['カンムテック', 'https://tech.kanmu.co.jp/feed'],
  ['クイック', 'https://aimstogeek.hatenablog.com/feed'],
  ['クックパッド', 'https://techlife.cookpad.com/feed'],
  ['クラウドワークス', 'https://engineer.crowdworks.jp/feed'],
  ['クラシコム', 'https://note.com/kurashicom_tech/rss'],
  ['コインチェック', 'https://tech.coincheck.blog/feed'],
  ['ココナラ', 'https://yomoyamablog.coconala.co.jp/feed'],
  ['コネヒト', 'https://tech.connehito.com/feed'],
  ['コミューン', 'https://tech.commmune.jp/feed'],
  ['コロプラ', 'https://blog.colopl.dev/feed'],
  ['サイオステクノロジー', 'https://tech-lab.sios.jp/feed'],
  ['サイバーエージェント', 'https://developers.cyberagent.co.jp/blog/feed/'],
  ['サイボウズ', 'https://blog.cybozu.io/feed'],
  ['ピクシブ', 'https://inside.pixiv.blog/feed'],
  ['食べチョク', 'https://tech.tabechoku.com/feed'],
]);

