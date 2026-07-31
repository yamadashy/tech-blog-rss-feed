import RssParser from 'rss-parser';
import { XMLValidator } from 'fast-xml-parser';
import { logger } from './logger';
import { to } from 'await-to-js';
import { Feed } from 'feed';

// XML 1.0 で禁止された制御文字かどうかを判定する
// 有効文字: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
function containsInvalidXmlChar(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (
      (code >= 0x0000 && code <= 0x0008) ||
      code === 0x000b ||
      code === 0x000c ||
      (code >= 0x000e && code <= 0x001f) ||
      code === 0xfffe ||
      code === 0xffff
    ) {
      return true;
    }
  }
  return false;
}

/**
 * フィードのバリデーション
 */
export class FeedValidator {
  public async assertFeed(feed: Feed): Promise<void> {
    logger.info('[FeedValidator] フィードのバリデーション開始');

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

    logger.info('[FeedValidator] フィードのバリデーション完了');
  }

  public async assertXmlFeed(label: string, feedXml: string): Promise<void> {
    const rssParser = new RssParser();

    logger.info(`[FeedValidator] XMLフィードのバリデーション開始。 label: ${label}`);

    // rss-parser で変換してみてエラーが出ないか確認
    const [rssParserError] = await to(rssParser.parseString(feedXml));
    if (rssParserError) {
      throw new Error(
        `rss-parserによるフィードのバリデーションエラーです。 label: ${label}, error: ${rssParserError}}`,
      );
    }

    // fast-xml-parser XMLValidator でバリデーション
    const atomValidateResult = XMLValidator.validate(feedXml);
    if (atomValidateResult !== true) {
      throw new Error(
        `fast-xml-parser XMLValidatorによるフィードのバリデーションエラーです。 label: ${label}, result: ${atomValidateResult}`,
      );
    }

    // XML 1.0 で禁止された制御文字のチェック
    if (containsInvalidXmlChar(feedXml)) {
      throw new Error(`フィードにXML 1.0で禁止された文字が含まれています。 label: ${label}`);
    }

    logger.info(`[FeedValidator] XMLフィードのバリデーション完了。 label: ${label}`);
  }
}
