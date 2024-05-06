import { FeedValidator } from '../src/feed/utils/feed-validator';
import { describe, it, expect } from 'vitest';

describe('FeedValidator', () => {
  it('正しいXMLフィードはtrue', async () => {
    const feedValidator = new FeedValidator();
    const validateResult = await feedValidator.validateFeed(
      `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログRSS</title>
      </feed>`,
    );
    expect(validateResult.isValid).toBe(true);
  });

  it('正しいXMLフィードはtrue', async () => {
    const feedValidator = new FeedValidator();
    const validateResult = await feedValidator.validateFeed(
      `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログRSS</title>
        <updated>2023-10-20T15:11:49.708Z</updated>
        <entry>
          <title type="html"><![CDATA[te\u{000b}st]]></title>
          <summary type="html"><![CDATA[test]]></summary>
        </entry>
      </feed>`,
    );
    expect(validateResult.isValid).toBe(false);
  });

  it('正しくないXMLフィードはfalse', async () => {
    const feedValidator = new FeedValidator();
    const validateResult = await feedValidator.validateFeed(
      `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">`,
    );
    expect(validateResult.isValid).toBe(false);
  });

  it('不正な文字を含む場合はfalse', async () => {
    const feedValidator = new FeedValidator();
    const validateResult = await feedValidator.validateFeed(
      `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログ\u{0010}RSS</title>
      </feed>`,
    );
    expect(validateResult.isValid).toBe(false);
  });

  it('不正な文字を含む場合はfalse', async () => {
    const feedValidator = new FeedValidator();
    const validateResult = await feedValidator.validateFeed(
      `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログRSS</title>
        <updated>2023-10-20T15:11:49.708Z</updated>
        <entry>
          <title type="html"><![CDATA[te\u{000b}st]]></title>
          <summary type="html"><![CDATA[test]]></summary>
        </entry>
      </feed>`,
    );
    expect(validateResult.isValid).toBe(false);
  });
});
