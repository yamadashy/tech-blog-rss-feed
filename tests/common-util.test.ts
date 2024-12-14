import { describe, expect, it } from 'vitest';
import { removeInvalidUnicode } from '../src/feed/common-util';

describe('removeInvalidUnicode', () => {
  it('不正なUnicode文字を除去', () => {
    const str = 'a\u{000b}b';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual('ab');
  });

  it('正常な文字列を変更しない', () => {
    const str = 'こんにちは, 今日は, hello, 你好, 안녕하세요, สวัสดีครับ.';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });

  it('空文字列を変更しない', () => {
    const str = '';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });

  it('スペースを削除しない', () => {
    const str = ' ,　';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });

  it('絵文字は削除しない', () => {
    const str = 'Hello, 😀world!😁';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });
});
