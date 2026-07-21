import type { Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export interface PruneCacheDirResult {
  dir: string;
  deletedFileCount: number;
  freedBytes: number;
}

export interface PruneCacheResult {
  dirResults: PruneCacheDirResult[];
  totalDeletedFileCount: number;
  totalFreedBytes: number;
}

/**
 * 指定したディレクトリ群から、mtime が maxAgeInDays より古いファイルを再帰的に削除する。
 * ディレクトリ自体は削除しない。対象ディレクトリが存在しない場合はスキップする。
 */
export const pruneCache = async (dirs: string[], maxAgeInDays: number): Promise<PruneCacheResult> => {
  const thresholdMs = Date.now() - maxAgeInDays * 24 * 60 * 60 * 1000;

  const dirResults: PruneCacheDirResult[] = [];
  for (const dir of dirs) {
    dirResults.push(await pruneDir(dir, dir, thresholdMs));
  }

  const totalDeletedFileCount = dirResults.reduce((sum, result) => sum + result.deletedFileCount, 0);
  const totalFreedBytes = dirResults.reduce((sum, result) => sum + result.freedBytes, 0);

  return { dirResults, totalDeletedFileCount, totalFreedBytes };
};

/**
 * 単一ディレクトリ配下（再帰的）を走査してファイルを削除する
 */
const pruneDir = async (rootDir: string, currentDir: string, thresholdMs: number): Promise<PruneCacheDirResult> => {
  let deletedFileCount = 0;
  let freedBytes = 0;

  let entries: Dirent<string>[];
  try {
    entries = await fs.readdir(currentDir, { withFileTypes: true, encoding: 'utf8' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // ディレクトリが存在しない場合はスキップ
      return { dir: rootDir, deletedFileCount, freedBytes };
    }
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      const subResult = await pruneDir(rootDir, entryPath, thresholdMs);
      deletedFileCount += subResult.deletedFileCount;
      freedBytes += subResult.freedBytes;
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const stat = await fs.stat(entryPath);
    if (stat.mtimeMs < thresholdMs) {
      freedBytes += stat.size;
      await fs.unlink(entryPath);
      deletedFileCount++;
    }
  }

  return { dir: rootDir, deletedFileCount, freedBytes };
};
