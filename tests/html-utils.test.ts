import { describe, expect, it } from 'vitest';
import { escapeHtml, truncateNunjucks } from '../src/site/_includes/components/html-utils';

describe('escapeHtml', () => {
  it('HTML特殊文字（& < > " \'）をエスケープ', () => {
    expect(escapeHtml('& < > " \'')).toEqual('&amp; &lt; &gt; &quot; &#39;');
  });

  it('バックスラッシュを &#92; にエスケープ', () => {
    expect(escapeHtml('a\\b')).toEqual('a&#92;b');
  });

  it('undefined は空文字にする', () => {
    expect(escapeHtml(undefined)).toEqual('');
  });

  it('null は空文字にする', () => {
    expect(escapeHtml(null)).toEqual('');
  });

  it('数値は文字列化してエスケープ', () => {
    expect(escapeHtml(42)).toEqual('42');
    expect(escapeHtml(0)).toEqual('0');
  });

  it('エスケープ対象を含まない文字列はそのまま返す', () => {
    expect(escapeHtml('こんにちは world')).toEqual('こんにちは world');
  });

  it('エスケープ済み文字列は二重エスケープされる', () => {
    expect(escapeHtml('&amp;')).toEqual('&amp;amp;');
  });

  it('複数の特殊文字が混在していても全てエスケープ', () => {
    expect(escapeHtml('<a href="x">A&B</a>')).toEqual('&lt;a href=&quot;x&quot;&gt;A&amp;B&lt;/a&gt;');
  });
});

describe('truncateNunjucks', () => {
  it('length 以下ならそのまま返す', () => {
    expect(truncateNunjucks('abc', 5)).toEqual('abc');
  });

  it('length と同じ長さならそのまま返す', () => {
    expect(truncateNunjucks('abcde', 5)).toEqual('abcde');
  });

  it('length を超える場合は substring(0, length) に末尾文字列を付与（省略記号分は引かない）', () => {
    expect(truncateNunjucks('abcdef', 5)).toEqual('abcde...');
  });

  it('end 文字列を指定できる', () => {
    expect(truncateNunjucks('abcdef', 3, '???')).toEqual('abc???');
  });

  it('undefined は空文字にする', () => {
    expect(truncateNunjucks(undefined, 5)).toEqual('');
  });

  it('null は空文字にする', () => {
    expect(truncateNunjucks(null, 5)).toEqual('');
  });
});
