import RssParser from 'rss-parser';
import { XMLValidator } from 'fast-xml-parser';
import { logger } from './logger';
import libxmljs from 'libxmljs';

export class FeedValidator {
  /**
   * フィードのバリデーション
   */
  public async validate(feedXml: string): Promise<boolean> {
    const rssParser = new RssParser();

    let isValid = true;

    logger.info('[FeedValidator] バリデーション開始');

    // rss-parser で変換してみてエラーが出ないか確認
    await rssParser.parseString(feedXml).catch((error) => {
      isValid = false;
      logger.error('[FeedValidator] RssParser でフィードのエラーが発生', error);
    });

    // XMLValidator でバリデーション
    const atomValidateResult = XMLValidator.validate(feedXml);
    if (atomValidateResult !== true) {
      isValid = false;
      logger.error('[FeedValidator] XMLValidator でフィードのエラーが発生', atomValidateResult);
    }

    // libxmljs でバリデーション
    await libxmljs.parseXmlAsync(feedXml).catch((error) => {
      isValid = false;
      logger.error('[FeedValidator] libxmljs でフィードのエラーが発生', error);
    });

    logger.info('[FeedValidator] バリデーション終了');

    return isValid;
  }
}
