import RssParser from 'rss-parser';
import { ValidationError, XMLValidator } from 'fast-xml-parser';
import { logger } from './logger';
import libxmljs from 'libxmljs';
import { to } from 'await-to-js';
import { FeedDistributionSet } from './feed-generator';

export interface FeedValidateResult {
  isValid: boolean;
  rssParserError: Error | null;
  atomValidateError: ValidationError | null;
  libxmljsError: Error | null;
}

/**
 * フィードのバリデーション
 */
export class FeedValidator {
  public async assertValidFeeds(feedDistributionSet: FeedDistributionSet): Promise<void> {
    const rssValidationResult = await this.validateFeed(feedDistributionSet.rss);
    const atomValidationResult = await this.validateFeed(feedDistributionSet.atom);
    if (!rssValidationResult.isValid || !atomValidationResult.isValid) {
      const rssValidationResultJson = JSON.stringify(rssValidationResult);
      const atomValidationResultJson = JSON.stringify(atomValidationResult);
      throw new Error(
        `まとめフィードのバリデーションエラーです。 rss: ${rssValidationResultJson}, atom: ${atomValidationResultJson}`,
      );
    }
  }

  public async validateFeed(feedXml: string): Promise<FeedValidateResult> {
    const rssParser = new RssParser();
    const feedValidateResult: FeedValidateResult = {
      isValid: true,
      rssParserError: null,
      atomValidateError: null,
      libxmljsError: null,
    };

    logger.info('[FeedValidator] バリデーション開始');

    // rss-parser で変換してみてエラーが出ないか確認
    const [rssParserError] = await to(rssParser.parseString(feedXml));
    if (rssParserError) {
      feedValidateResult.isValid = false;
      feedValidateResult.rssParserError = rssParserError;
    }

    // XMLValidator でバリデーション
    const atomValidateResult = XMLValidator.validate(feedXml);
    if (atomValidateResult !== true) {
      feedValidateResult.isValid = false;
      feedValidateResult.atomValidateError = atomValidateResult;
    }

    // libxmljs でバリデーション
    try {
      libxmljs.parseXml(feedXml);
    } catch (libxmljsError) {
      feedValidateResult.isValid = false;
      if (libxmljsError instanceof Error) {
        feedValidateResult.libxmljsError = libxmljsError;
      }
    }

    logger.info('[FeedValidator] バリデーション終了');

    return feedValidateResult;
  }
}
