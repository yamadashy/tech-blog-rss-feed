import * as path from 'node:path';
import * as url from 'node:url';
import constants from '../common/constants';
import { logger } from '../feed/logger';
import { pruneCache } from '../feed/prune-cache';

const dirName = url.fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT_DIR_PATH = path.join(dirName, '../..');

// プルーニング対象のディレクトリ
// - .cache: flat-cache（フィード・OGPキャッシュ）と eleventy-fetch（画像バッファ）が使う
// - public/images/feed-thumbnails, public/images/feed-icons: eleventy-img が生成するサムネイル・アイコン
//
// フィードキャッシュは1時間、OGPキャッシュは記事が集計対象期間(8日間)に入っている間24時間おき、
// eleventy-fetchのバッファは3日おきに書き換わって mtime が更新されるため、
// mtime が constants.cachePruneThresholdInDays より古いファイルは実質使われなくなったキャッシュとみなせる。
// 生成画像(feed-thumbnails/feed-icons)は古い mtime のまま参照され続ける可能性があるが、
// このコマンドは CI 上で site-prepare / site-build より前に実行するため、
// まだ必要な画像は同じ実行内で再生成される（自己修復的なので消しすぎを心配しなくてよい）。
const TARGET_DIRS = [
  path.join(REPO_ROOT_DIR_PATH, '.cache'),
  path.join(REPO_ROOT_DIR_PATH, 'public/images/feed-thumbnails'),
  path.join(REPO_ROOT_DIR_PATH, 'public/images/feed-icons'),
];

(async () => {
  logger.info('[prune-cache] start', TARGET_DIRS);

  const result = await pruneCache(TARGET_DIRS, constants.cachePruneThresholdInDays);

  for (const dirResult of result.dirResults) {
    logger.info(
      '[prune-cache] pruned',
      dirResult.dir,
      `${dirResult.deletedFileCount} files deleted`,
      `${(dirResult.freedBytes / 1024 / 1024).toFixed(2)} MB freed`,
    );
  }

  logger.info(
    '[prune-cache] finished',
    `${result.totalDeletedFileCount} files deleted`,
    `${(result.totalFreedBytes / 1024 / 1024).toFixed(2)} MB freed in total`,
  );
})();
