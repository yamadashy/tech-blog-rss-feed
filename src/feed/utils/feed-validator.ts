import RssParser from 'rss-parser';
import { XMLValidator } from 'fast-xml-parser';
import { logger } from './logger';
import libxmljs from 'libxmljs';
import { to } from 'await-to-js';
import { Feed } from 'feed';

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

    // libxmljs でバリデーション
    try {
      libxmljs.parseXml(feedXml);
    } catch (libxmljsError) {
      if (libxmljsError instanceof Error) {
        throw new Error(`libxmljsによるフィードのバリデーションエラーです。 error: ${libxmljsError.message}`);
      }
    }

    logger.info(`[FeedValidator] XMLフィードのバリデーション完了。 label: ${label}`);
  }
}
