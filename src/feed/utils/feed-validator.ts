import { to } from 'await-to-js';
import { XMLValidator } from 'fast-xml-parser';
import type { Feed } from 'feed';
import libxmljs from 'libxmljs';
import RssParser from 'rss-parser';

/**
 * フィードのバリデーション
 */
export class FeedValidator {
  public async assertFeed(feed: Feed): Promise<void> {
    // 一つでもimageがあればok
    let isImageFound = false;
    for (const item of feed.items) {
      if (item.image) {
        isImageFound = true;
        break;
      }
    }
    if (!isImageFound) {
      throw new Error('フィードに画像情報が一つもありません');
    }
  }

  public async assertXmlFeed(label: string, feedXml: string): Promise<void> {
    const rssParser = new RssParser();

    // rss-parser で変換してみてエラーが出ないか確認
    const [rssParserError] = await to(rssParser.parseString(feedXml));
    if (rssParserError) {
      throw new Error(
        `rss-parserによるフィードのバリデーションエラーです。 label: ${label}, error: ${rssParserError}}`,
        {
          cause: rssParserError,
        },
      );
    }

    // fast-xml-parser XMLValidator でバリデーション
    const atomValidateResult = XMLValidator.validate(feedXml);
    if (atomValidateResult !== true) {
      throw new Error(
        `fast-xml-parser XMLValidatorによるフィードのバリデーションエラーです。 label: ${label}, result: ${atomValidateResult}`,
        {
          cause: atomValidateResult,
        },
      );
    }

    // libxmljs でバリデーション
    try {
      libxmljs.parseXml(feedXml);
    } catch (libxmljsError) {
      if (libxmljsError instanceof Error) {
        throw new Error(
          `libxmljsによるフィードのバリデーションエラーです。 label: ${label}, error: ${libxmljsError.message}`,
          {
            cause: libxmljsError,
          },
        );
      }
    }
  }
}
