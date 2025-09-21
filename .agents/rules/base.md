---
alwaysApply: true
---

# プロジェクト概要

README.md を読んで理解してください

# ルール

## フィード追加のルール

ユーザーにフィードを追加してと言われたら、以下の手順でフィードを追加してください

1. フィード追加の最低限の情報をユーザーに聞く
  - 企業名
  - RSSフィードURL
2. ブランチ作成
   `git checkout -b chore/new-feed-<企業名の英語>`
3. フィードを追加
   `src/resources/feed-info-list.ts` の `FEED_INFO_LIST` を更新
4. コミット
   `git commit -am 'chore(feed): <企業名など> 追加`
5. プッシュ
   `git push origin chore/new-feed-<企業名の英語>`
6. プルリクを作成
   pull_request_template.md を参考にプルリクを作成してください
   ghコマンドがあればそれを使用し、なければユーザーに作成方法を指示してください

すべての手順は都度ユーザーに同意を得て進めてください
