import Eleventy from '@11ty/eleventy';

/**
 * Eleventy でサイトをビルドする。
 * CLI（`eleventy --config=...`）ではなくプログラマティック API を使うのは、ビルド完了後に明示的にプロセスを終了するため。
 * 画像取得後に残る TCP ソケットがイベントループを保持し、CLI だと書き出し完了後も 10〜20 秒プロセスが終了しない
 */
(async () => {
  const eleventy = new Eleventy(undefined, undefined, {
    configPath: 'eleventy.config.ts',
    source: 'cli',
  });

  await eleventy.write();
})().then(
  () => {
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
