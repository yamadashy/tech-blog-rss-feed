# 企業テックブログRSS
企業のテックブログの更新をまとめたRSSフィードを配信しています。  
記事を読んでその企業の技術・カルチャーを知れることや、質の高い技術情報を得られることを目的としています。

https://yamadashy.github.io/tech-blog-rss-feed/

# サイトの追加方法
issue を作っていただけると私が追加します。  
（内容によっては保留とさせていただきます）

プルリクを送っていただけると大変助かります。

## プルリクでの送り方
1. このリポジトリをフォーク
2. ブランチ作成  
   `git checkout -b new-blog-feed-xxx`
3. フィードを追加  
   `src/resources/feed.info-list.ts` の `FEED_INFO_LIST` を更新
4. コミット  
   `git commit -am 'add: 新規フィード追加`
5. プッシュ  
   `git push origin new-blog-feed-xxx`
6. プルリクを作成

# 仕組み
GitHub Actions で動いており、サイトの生成は [Eleventy](https://www.11ty.dev/) を使用しています。
