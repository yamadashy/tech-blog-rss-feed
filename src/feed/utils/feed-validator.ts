import { to } from 'await-to-js';
import { XMLValidator } from 'fast-xml-parser';
import type { Feed } from 'feed';
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

    // 不正な制御文字のチェック（改行・タブ・スペース以外の制御文字）
    // biome-ignore lint/suspicious/noControlCharactersInRegex: この正規表現は制御文字を検出するために使用しています
    const invalidControlCharsRegex = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g;
    if (invalidControlCharsRegex.test(feedXml)) {
      throw new Error(`フィードに不正な制御文字が含まれています。 label: ${label}`);
    }
  }
}
