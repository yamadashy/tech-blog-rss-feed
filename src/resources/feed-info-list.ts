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
  ['Aiming', 'https://developer.aiming-inc.com/feed'],
  ['AppBrew', 'https://tech.appbrew.io/feed'],
  ['BASE', 'https://devblog.thebase.in/feed'],
  ['CADDi', 'https://caddi.tech/feed'],
  ['CARTA', 'https://techblog.cartaholdings.co.jp/feed'],
  ['DMM', 'https://inside.dmm.com/feed'],
  ['DeNA', 'https://engineering.dena.com/blog/index.xml'],
  ['Dentsu Digital', 'https://note.com/dd_techblog/rss'],
  ['ENECHANGE', 'https://tech.enechange.co.jp/feed'],
  ['Emotion Tech', 'https://tech.emotion-tech.co.jp/feed'],
  ['GMOアドパートナーズ', 'https://techblog.gmo-ap.jp/feed/'],
  ['GMOペパボ', 'https://tech.pepabo.com/feed.xml'],
  ['GMOメディア', 'https://blog.gmo.media/feed/atom/'],
  ['GREE', 'https://labs.gree.jp/blog/feed/'],
  ['GameWith', 'https://tech.gamewith.co.jp/feed'],
  ['Google', 'https://developers-jp.googleblog.com/atom.xml'],
  ['Gunosy', 'https://tech.gunosy.io/feed'],
  ['HERP', 'https://tech-hub.herp.co.jp/feed.xml'],
  ['MUGENUP', 'https://mugenup-tech.hatenadiary.com/feed'],
  ['Mirrativ', 'https://tech.mirrativ.stream/feed'],
  ['Money Forward Kessai', 'https://tech.mfkessai.co.jp/index.xml'],
  ['NEMTUS', 'https://zenn.dev/nemtus/feed'],
  ['NHNテコラス', 'https://techblog.nhn-techorus.com/feed'],
  ['OPEN8', 'https://open8tech.hatenablog.com/feed'],
  ['SEGA', 'https://techblog.sega.jp/feed'],
  ['Safie', 'https://engineers.safie.link/feed'],
  ['Salesforce', 'https://developer.salesforce.com/jpblogs/feed/'],
  ['Sansan', 'https://buildersbox.corp-sansan.com/feed'],
  ['SmartHR', 'https://tech.smarthr.jp/feed'],
  ['SmartNews', 'https://developer.smartnews.com/blog/feed'],
  ['Speee', 'https://tech.speee.jp/feed'],
  ['Wiz', 'https://tech.012grp.co.jp/feed'],
  ['YAZ', 'https://www.yaz.co.jp/feed'],
  ['Yahoo! JAPAN', 'https://techblog.yahoo.co.jp/atom.xml'],
  ['Yappli', 'https://tech.yappli.io/feed'],
  ['ZOZO', 'https://techblog.zozo.com/feed'],
  ['Zaim', 'https://blog.zaim.co.jp/rss'],
  ['あした', 'https://engineer.ashita-team.com/feed'],
  ['くらしのマーケット', 'https://tech.curama.jp/feed'],
  ['ぐるなび', 'https://developers.gnavi.co.jp/feed'],
  ['さくら', 'https://knowledge.sakura.ad.jp/rss/'],
  ['はてな', 'https://developer.hatenastaff.com/feed'],
  ['アイスタイル', 'https://techblog.istyle.co.jp/feed'],
  ['アイレット', 'https://cloudpack.media/tech/feed'],
  ['エムティーアイ', 'https://tech.mti.co.jp/feed'],
  ['オールアバウト', 'https://allabout-tech.hatenablog.com/feed'],
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
  ['シタテル', 'https://tech-blog.sitateru.com/feeds/posts/default'],
  ['スペースマーケット', 'https://blog.spacemarket.com/category/code/feed/'],
  ['スマートキャンプ', 'https://tech.smartcamp.co.jp/feed'],
  ['スマートスタイル', 'https://blog.s-style.co.jp/feed/'],
  ['ドワンゴ教育サービス', 'https://blog.nnn.dev/feed'],
  ['ヌーラボ', 'https://nulab.com/ja/blog/categories/techblog/feed/'],
  ['ハンズラボ', 'https://www.hands-lab.com/feed'],
  ['ハートビーツ', 'https://heartbeats.jp/hbblog/atom.xml'],
  ['バイセル', 'https://tech.buysell-technologies.com/feed'],
  ['ヒストリア', 'https://historia.co.jp/feed'],
  ['ビザスク', 'https://tech.visasq.com/feed'],
  ['ビットバンク', 'https://tech.bitbank.cc/rss/'],
  ['ピクシブ', 'https://inside.pixiv.blog/feed'],
  ['ピクスタ', 'https://texta.pixta.jp/feed'],
  ['ファブリカ', 'https://www.fabrica-com.co.jp/techblog/feed/'],
  ['フィードフォース', 'https://developer.feedforce.jp/feed'],
  ['ミクシィ', 'https://mixi-developers.mixi.co.jp/feed'],
  ['メディアドゥ', 'https://techdo.mediado.jp/feed'],
  ['メドピア', 'https://tech.medpeer.co.jp/feed'],
  ['メドレー', 'https://developer.medley.jp/feed'],
  ['メルカリ', 'https://engineering.mercari.com/blog/feed.xml/'],
  ['モノタロウ', 'https://tech-blog.monotaro.com/feed'],
  ['モバイルファクトリー', 'https://tech.mobilefactory.jp/feed'],
  ['レコチョク', 'https://techblog.recochoku.jp/feed/atom'],
  ['レンジャーシステムズ', 'https://ranger-systems.co.jp/blog-engineer/feed'],
  ['虎の穴', 'https://toranoana-lab.hatenablog.com/feed'],
  ['食べチョク', 'https://tech.tabechoku.com/feed'],
]);

// 候補
// パースエラー修正
// ['Advanced Technology Lab', 'https://atl.recruit.co.jp/blog/feed/'],
// パースエラー修正
// ['Qiita', 'https://zine.qiita.com/'],
// 日本語以外が交じるのを解消できたら入れたい
// ['クラスメソッド', 'https://dev.classmethod.jp/feed'],
// 403 Forbidden
// ['Cygames', 'https://tech.cygames.co.jp/feed/'],
