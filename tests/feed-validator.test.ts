import to from 'await-to-js';
import { FeedValidator } from '../src/feed/utils/feed-validator';
import { describe, it, expect } from 'vitest';

describe('FeedValidator', () => {
  it('正しいXMLフィード1', async () => {
    const feedValidator = new FeedValidator();
    const [error] = await to(
      feedValidator.assertXmlFeed(
        'test',
        `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログRSS</title>
      </feed>`,
      ),
    );
    expect(error).toBeNull();
  });

  it('正しいXMLフィード', async () => {
    const feedValidator = new FeedValidator();
    const [error] = await to(
      feedValidator.assertXmlFeed(
        'test',
        `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログRSS</title>
        <updated>2023-10-20T15:11:49.708Z</updated>
        <entry>
          <title type="html"><![CDATA[test]]></title>
          <summary type="html"><![CDATA[test]]></summary>
        </entry>
      </feed>`,
      ),
    );
    console.log(error);
    expect(error).toBeNull();
  });

  it('正しくないXMLフィード', async () => {
    const feedValidator = new FeedValidator();
    const [error] = await to(
      feedValidator.assertXmlFeed(
        'test',
        `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">`,
      ),
    );
    expect(error).not.toBeNull();
  });

  it('不正な文字を含む', async () => {
    const feedValidator = new FeedValidator();
    const [error] = await to(
      feedValidator.assertXmlFeed(
        'test',
        `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <id>https://yamadashy.github.io/tech-blog-rss-feed/</id>
        <title>企業テックブログ\u{0010}RSS</title>
      </feed>`,
      ),
    );
    expect(error).not.toBeNull();
  });

  it('不正な文字を含む', async () => {
    const feedValidator = new FeedValidator();
    const [error] = await to(
      feedValidator.assertXmlFeed(
        'test',
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
      ),
    );
    expect(error).not.toBeNull();
  });
});
