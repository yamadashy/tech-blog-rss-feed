import RssParser from 'rss-parser';
import { ValidationError, XMLValidator } from 'fast-xml-parser';
import { logger } from './logger';
import libxmljs from 'libxmljs';

export type FeedValidateResult = {
  isValid: boolean;
  rssParserError: Error | null;
  atomValidateError: ValidationError | null;
  libxmljsError: Error | null;
};

/**
 * フィードのバリデーション
 */
export class FeedValidator {
  public async validate(feedXml: string): Promise<FeedValidateResult> {
    const rssParser = new RssParser();
    const feedValidateResult: FeedValidateResult = {
      isValid: true,
      rssParserError: null,
      atomValidateError: null,
      libxmljsError: null,
    };

    logger.info('[FeedValidator] バリデーション開始');

    // rss-parser で変換してみてエラーが出ないか確認
    await rssParser.parseString(feedXml).catch((error) => {
      feedValidateResult.isValid = false;
      feedValidateResult.rssParserError = error;
    });

    // XMLValidator でバリデーション
    const atomValidateResult = XMLValidator.validate(feedXml);
    if (atomValidateResult !== true) {
      feedValidateResult.isValid = false;
      feedValidateResult.atomValidateError = atomValidateResult;
    }

    // libxmljs でバリデーション
    await libxmljs.parseXmlAsync(feedXml).catch((error) => {
      feedValidateResult.isValid = false;
      feedValidateResult.libxmljsError = error;
    });

    logger.info('[FeedValidator] バリデーション終了');

    return feedValidateResult;
  }
}
