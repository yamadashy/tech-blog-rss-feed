# 企業テックブログRSS
企業のテックブログの更新をまとめたRSSフィードを配信しています。  
記事を読んでその企業の技術・カルチャーを知れることや、質の高い技術情報を得られることを目的としています。

https://yamadashy.github.io/tech-blog-rss-feed/

独自のフィードを作って公開したい場合は自由にフォークしてください。

# サイト追加の方針
企業のテックブログ（技術ブログ、エンジニアブログ）であれば、基本的には追加します。  
ただし、以下に該当するものは検討します。

- その企業の取り組みでないものが多く投稿される可能性があるブログ
  - テック系メディア
  - Qiita Organization など、組織として投稿しているかの線引が曖昧なもの
- 記事が自社製品の紹介のみ
- 日本語以外の言語で書かれている記事が多いブログ

逆に、以下はテックブログと判断して追加しています。

- Zenn の企業系アカウント

# サイトの追加方法
[src/resources/feed-info-list.ts](https://github.com/yamadashy/tech-blog-rss-feed/blob/main/src/resources/feed-info-list.ts) で管理しており、その一覧にない場合 issue を作っていただければ対応します。  

プルリクを送っていただけると大変助かります。

## プルリクでの送り方
1. このリポジトリをフォーク
2. ブランチ作成  
   `git checkout -b new-blog-feed-xxx`
3. フィードを追加  
   `src/resources/feed-info-list.ts` の `FEED_INFO_LIST` を更新
4. コミット  
   `git commit -am 'add: 新規フィード追加`
5. プッシュ  
   `git push origin new-blog-feed-xxx`
6. プルリクを作成

# 仕組み
GitHub Actions で定期的に更新されており、サイトの生成は [Eleventy](https://www.11ty.dev/) を使用しています。

更新は多少遅延ありますが以下のタイミングで行います。
- 平日8時~22時の2時間おき
- 休日8時~20時の4時間おき

# ライセンス
MIT
