import { relativeUrlFilter } from '../../../common/eleventy-utils';
import { escapeHtml } from './html-utils';
import type { EleventyPage } from './types';

/**
 * partials/nav.njk 相当のナビゲーション。
 */
export const renderNav = (page: EleventyPage): string => {
  const relativeUrl = escapeHtml(relativeUrlFilter(page.url));
  const feedActive = ['/'].includes(page.url) ? 'ui-section-nav__link--active' : '';
  const hotActive = ['/hot/'].includes(page.url) ? 'ui-section-nav__link--active' : '';
  const blogsActive = ['/blogs/'].includes(page.url) ? 'ui-section-nav__link--active' : '';

  return `<nav class='ui-nav'>
    <div class='ui-layout-container'>
        <div class='ui-section-nav__layout ui-layout-flex'>
            <a class='ui-section-nav__link ${feedActive}' href='${relativeUrl}'>フィード</a>
            <a class='ui-section-nav__link ${hotActive}' href='${relativeUrl}hot/'>人気フィード</a>
            <a class='ui-section-nav__link ${blogsActive}' href='${relativeUrl}blogs/'>ブログ一覧</a>
        </div>
    </div>
</nav>`;
};
