# <img src="src/site/images/icon-transparent.png" height=26> 生成AI・LLM関連テックブログRSS
生成AI・LLM関連テックブログの更新をまとめたRSSフィードを配信しています。  
記事を読んでその企業の技術・カルチャーを知れることや、質の高い技術情報を得られることを目的としています。
URL: https://r-kagaya.github.io/llm-tech-blog-rss-feed/

[@yamadashy](https://github.com/yamadashy)さんの作成された[yamadashy/tech-blog-rss-feed](https://github.com/yamadashy/tech-blog-rss-feed)をフォークして作成されています。

## サイト追加の方針(TBD)

## サイトの追加方法
[src/resources/feed-info-list.ts](https://github.com/yamadashy/tech-blog-rss-feed/blob/main/src/resources/feed-info-list.ts) で管理しており、その一覧にない場合 issue を作っていただければ対応します。  

### プルリクでの送り方
もしプルリクを送っていただける場合は以下のように作成できます。

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

## 開発

### 仕組み
GitHub Actions で定期的に更新されており、サイトの生成は [Eleventy](https://www.11ty.dev/) を使用しています。

更新は多少遅延ありますが以下のタイミングで行います。
- 平日 8時-24時の1時間おき
- 休日 8時-24時の2時間おき

### フォークして使う場合
以下を書き換えると独自のサイトが動きます。

- `src/common/constants.js` の URL など
- `src/resources/feed-info-list.ts` のブログ情報

特定のブログに絞ったり、以下のように全く違ったフィードを作るもの良いと思います。

- [MATLAB-blog-rss-feed](https://github.com/minoue-xx/MATLAB-blog-rss-feed) ... MATLAB/Simulink 関連ブログの更新をまとめたRSSフィードを配信

### 開発用コマンド
フィード生成とサイト立ち上げ
```bash
$ # フィードを取得して作成
$ yarn feed:generate

$ # localhost:8080 で確認
$ yarn site:serve
```

コードのチェック
```bash
$ # lint
$ yarn lint

$ # テスト
$ yarn test
```

## ライセンス
MIT
