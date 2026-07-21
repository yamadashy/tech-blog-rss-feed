import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pruneCache } from '../src/feed/prune-cache';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe('pruneCache', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prune-cache-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const writeFileWithMtime = async (filePath: string, mtimeMs: number, content = 'x') => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    const mtime = new Date(mtimeMs);
    await fs.utimes(filePath, mtime, mtime);
  };

  it('mtimeが古いファイルを削除し、新しいファイルは残す', async () => {
    const dir = path.join(tempDir, 'cache-dir');
    const oldFile = path.join(dir, 'old-file.txt');
    const freshFile = path.join(dir, 'fresh-file.txt');

    await writeFileWithMtime(oldFile, Date.now() - 15 * ONE_DAY_MS, 'old-content');
    await writeFileWithMtime(freshFile, Date.now() - 1 * ONE_DAY_MS, 'fresh-content');

    const result = await pruneCache([dir], 14);

    await expect(fs.access(oldFile)).rejects.toThrow();
    await expect(fs.access(freshFile)).resolves.toBeUndefined();

    expect(result.totalDeletedFileCount).toEqual(1);
    expect(result.totalFreedBytes).toEqual(Buffer.byteLength('old-content'));
    expect(result.dirResults).toEqual([
      {
        dir,
        deletedFileCount: 1,
        freedBytes: Buffer.byteLength('old-content'),
      },
    ]);
  });

  it('サブディレクトリも再帰的に走査し、ディレクトリ自体は削除しない', async () => {
    const dir = path.join(tempDir, 'cache-dir');
    const nestedOldFile = path.join(dir, 'nested', 'old-file.txt');
    const nestedFreshFile = path.join(dir, 'nested', 'fresh-file.txt');

    await writeFileWithMtime(nestedOldFile, Date.now() - 20 * ONE_DAY_MS);
    await writeFileWithMtime(nestedFreshFile, Date.now());

    const result = await pruneCache([dir], 14);

    await expect(fs.access(nestedOldFile)).rejects.toThrow();
    await expect(fs.access(nestedFreshFile)).resolves.toBeUndefined();
    // ディレクトリ自体は削除されず残っている
    await expect(fs.access(path.join(dir, 'nested'))).resolves.toBeUndefined();

    expect(result.totalDeletedFileCount).toEqual(1);
  });

  it('存在しないディレクトリはスキップしてエラーにならない', async () => {
    const missingDir = path.join(tempDir, 'does-not-exist');

    const result = await pruneCache([missingDir], 14);

    expect(result.totalDeletedFileCount).toEqual(0);
    expect(result.totalFreedBytes).toEqual(0);
    expect(result.dirResults).toEqual([{ dir: missingDir, deletedFileCount: 0, freedBytes: 0 }]);
  });

  it('複数ディレクトリを処理し、統計を合算する', async () => {
    const dirA = path.join(tempDir, 'dir-a');
    const dirB = path.join(tempDir, 'dir-b');

    await writeFileWithMtime(path.join(dirA, 'old.txt'), Date.now() - 30 * ONE_DAY_MS, 'aaaa');
    await writeFileWithMtime(path.join(dirB, 'old.txt'), Date.now() - 30 * ONE_DAY_MS, 'bb');

    const result = await pruneCache([dirA, dirB], 14);

    expect(result.totalDeletedFileCount).toEqual(2);
    expect(result.totalFreedBytes).toEqual(Buffer.byteLength('aaaa') + Buffer.byteLength('bb'));
  });

  it('閾値ちょうどのしきい値より新しいファイルは削除しない', async () => {
    const dir = path.join(tempDir, 'cache-dir');
    const justInsideThreshold = path.join(dir, 'inside.txt');

    // 13日前は14日しきい値より新しいので残る
    await writeFileWithMtime(justInsideThreshold, Date.now() - 13 * ONE_DAY_MS);

    const result = await pruneCache([dir], 14);

    await expect(fs.access(justInsideThreshold)).resolves.toBeUndefined();
    expect(result.totalDeletedFileCount).toEqual(0);
  });
});
