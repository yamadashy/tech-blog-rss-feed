import { describe, expect, it } from 'vitest';
import { minifyCssFilter, relativeUrlFilter } from '../src/common/eleventy-utils';

describe('relativeUrlFilter', () => {
  it('ルート（/）は ./ を返す', () => {
    expect(relativeUrlFilter('/')).toEqual('./');
  });

  it('1 階層下（/hot/）は ../ を返す', () => {
    expect(relativeUrlFilter('/hot/')).toEqual('../');
  });

  it('2 階層下（/blogs/<hash>/）は ../../ を返す', () => {
    expect(relativeUrlFilter('/blogs/abc123/')).toEqual('../../');
  });
});

describe('minifyCssFilter', () => {
  it('余分な空白を除去して CSS を圧縮する', () => {
    expect(minifyCssFilter('a {  color:  red ;  }')).toEqual('a{color:red}');
  });

  it('空文字は空文字を返す', () => {
    expect(minifyCssFilter('')).toEqual('');
  });
});
