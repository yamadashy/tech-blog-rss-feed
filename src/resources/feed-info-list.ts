type ValidUrl = `${'http' | 'https'}://${string}.${string}`;

type FeedInfoTuple = [label: string, url: ValidUrl];

export interface FeedInfo {
  label: string;
  url: ValidUrl;
}

const createFeedInfoList = (feedInfoTuples: FeedInfoTuple[]) => {
  const feedInfoList: FeedInfo[] = [];

  for (const [label, url] of feedInfoTuples) {
    feedInfoList.push({
      label,
      url,
    });
  }

  return feedInfoList;
};

/**
 * フィード情報一覧。アルファベット順
 * ラベルが被るとバリデーションエラーになるので別のラベルを設定してください
 */
// prettier-ignore
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  // ['企業名・製品名など', 'RSS/AtomフィードのURL'],
  ['test', 'https://www.aha.io/blog/feed.xml'],
]);

/**
 * その他候補
 *
 * RSSがなくなった。復活したら入れたい
 * https://blog.gmo.media/
 *
 * リニューアルされてフィードが消えたのでしばらくしたら確認
 * ['DMM', 'https://inside.dmm.com/feed'],
 * ['divx', 'https://engineering.divx.co.jp/feed'],
 *
 * 技術のカテゴリ切られてないので悩ましい
 * ['Ragate', 'https://www.ragate.co.jp/blog/'],
 *
 * 403 Forbidden
 * ['Cygames', 'https://tech.cygames.co.jp/feed/'],
 * ['BRANU', 'https://tech.branu.jp/feed'],
 * ['i-plug', 'https://itbl.hatenablog.com/feed'],
 * ['UUUM', 'https://system.blog.uuum.jp/feed'],
 * ['CROOZ SHOPLIST', encodeURI('https://crooz.co.jp/recruit_group/blog/category/テックブログ/feed/')],
 * ['マクロミル', 'https://techblog.macromill.com/feed'],
 *
 * 404
 * ['リクルートデータ', 'https://blog.recruit.co.jp/data/index.json'],
 * ['Findy Teams', 'https://engineering-org.findy-teams.com/feed.xml'],
 * ['KINTOテクノロジーズ', 'https://blog.kinto-technologies.com/feed.xml'],
 * ['テリロジー', 'https://terilogy-tech.hatenablog.com/feed'],
 * ['ヘイ データチーム', 'https://data.hey.jp/feed'],
 * ['FLINTERS', 'https://labs.septeni.co.jp/feed'],
 * ['crispy', 'https://blog.crispy-inc.com/feed'],
 * ['スタートアップテクノロジー', 'https://startup-technology.com/feed'],
 * ['JBCC', 'https://jbcc-tech.hatenablog.com/feed'],
 * ['UnReact', 'https://zenn.dev/unreact/feed'],
 * ['Zeals', 'https://tech.zeals.co.jp/feed'],
 * ['hokan', 'https://medium.com/feed/@hokan_dev'],
 *
 * unable to verify the first certificate
 * ['エムアールピー', 'https://mrp-net.co.jp/tech_blog/feed'],
 *
 * certificate has expired
 * ['キャスレーコンサルティング', 'https://www.casleyconsulting.co.jp/blog/engineer/feed/'],
 *
 * pubDate なし
 * ['リクルート', 'https://engineers.recruit-jinji.jp/techblog/feed/']
 *
 * 削除された？
 * ['NAXA', 'https://blog.naxa.co.jp/feed'],
 * ['Reigle', 'https://www.reigle.info/feed'],
 * ['HiTTO', 'https://product-blog.hitto.co.jp/feed'],
 * ['グッドワークス', 'https://zenn.dev/goodworks/feed'],
 * ['Croooober', 'https://tech.croooober.co.jp/feed'],
 * ['トライステージ', 'https://blog.ddm.tri-stage.jp/feed/'],
 * ['ヒュープロ', 'https://hupro-techblog.hatenablog.com/feed'],
 * ['ファンコミュニケーションズ', 'https://tech-blog.fancs.com/feed'],
 * ['HiCustomer', 'https://tech.hicustomer.jp/index.xml'],
 * ['シタテル', 'https://tech-blog.sitateru.com/feeds/posts/default'],
 * ['Salesforce', 'https://developer.salesforce.com/jpblogs/feed/'],
 * ['ホクソエム', 'https://blog.hoxo-m.com/feed'],
 *
 * フィードなし。スクレイピング？
 * https://lab.mo-t.com/blog
 * https://tech-blog.sweeep.ai/
 * https://minedia-engineer-hub-minedia.vercel.app/
 * https://segaxd.co.jp/news/?category=blog
 * https://tech.smartshopping.co.jp/
 * https://olaris.jp/category/technology
 * https://licensecounter.jp/engineer-voice/blog/
 * https://tech.ilovex.co.jp/
 * https://developer.nvidia.com/ja-jp/blog/
 * https://www.vision-c.co.jp/engineerblog
 * https://www.cresco.co.jp/blog/
 * https://blog.genda.jp/creators/
 * https://lab.hokadoko.com/news/RTEPiK54
 * https://subthread.co.jp/blog/
 * ['QualiArts', 'https://technote.qualiarts.jp/rss.xml'],
 * https://securesky-plus.com/engineerblog/
 * https://www.monolithsoft.co.jp/techblog/
 *
 * 日本語以外
 * https://medium.com/feed/mcdonalds-technical-blog
 * https://netflixtechblog.com/
 * https://discord.com/blog/
 * https://www.twilio.com/blog
 * https://engineering.monstar-lab.com/en/
 *
 * TODO: スライド系も追加？
 * https://speakerdeck.com/line_developers
 */
