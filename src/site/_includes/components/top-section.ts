import constants from '../../../common/constants';
import { relativeUrlFilter } from '../../../common/eleventy-utils';
import { escapeHtml } from './html-utils';
import type { EleventyPage } from './types';

/**
 * partials/top-section.njk 相当のトップセクション。
 */
export const renderTopSection = (page: EleventyPage): string => {
  const relativeUrl = escapeHtml(relativeUrlFilter(page.url));
  const rssFeedUrl = escapeHtml(constants.feedUrls.rss);

  return `<section class="ui-section-content ui-top-section">
    <div class="ui-layout-container">
        <div class="ui-layout-column-6 ui-layout-column-center">
            <p class="ui-text-intro">
                企業のテックブログの更新をまとめた<br>RSSフィードを配信しています<br>
            </p>
            <div class="ui-component-cta ui-layout-flex">
                <form class="ui-component-form ui-layout-grid">
                    <label class='ui-component-form__label' for='feed-url-slack'>
                        <img src='${relativeUrl}images/slack-mark.png' alt='Slackのロゴ' loading="eager" width='96' height='96'>
                    </label>
                    <input type='text' id='feed-url-slack' class="ui-component-input ui-component-input-medium" readonly value='/feed ${rssFeedUrl}'>
                    <button type="button" class="ui-component-button ui-component-button-medium ui-component-button-primary feed-url-copy-button">コピー</button>
                </form>
                <p class="ui-text-note"><small>Slackに貼り付けると更新を受け取ることができます</small></p>
                <form class="ui-component-form ui-layout-grid">
                    <label class='ui-component-form__label' for='feed-url-rss'>
                        <span>RSS URL</span>
                    </label>
                    <input type='text' id='feed-url-rss' class="ui-component-input ui-component-input-medium" readonly value='${rssFeedUrl}'>
                    <button type="button" class="ui-component-button ui-component-button-medium ui-component-button-primary feed-url-copy-button">コピー</button>
                </form>
                <div class='ui-top-section__subscribe'>
                    <a href='https://feedly.com/i/subscription/feed/${rssFeedUrl}' target="_blank" rel="noopener noreferrer">
                        <img src='${relativeUrl}images/subscribe-feedly.png' loading="eager" alt='follow us in feedly' width='152' height='56'>
                    </a>
                    <a href="https://www.inoreader.com?add_feed=${rssFeedUrl}" target="_blank" rel="noopener noreferrer">
                        <img src="${relativeUrl}images/subscribe-inoreader.png" loading="eager" alt="follow us in inoreader" width='260' height='72'>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>`;
};
