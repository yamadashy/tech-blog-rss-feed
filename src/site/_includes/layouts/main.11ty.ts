import constants from '../../../common/constants';
import { relativeUrlFilter } from '../../../common/eleventy-utils';
import { escapeHtml } from '../components/html-utils';
import { relativeTimeScript } from '../components/scripts';
import type { EleventyPage } from '../components/types';

interface MainLayoutData {
  content: string;
  pageTitle: unknown;
  page: EleventyPage;
}

/**
 * layouts/main.njk 相当のレイアウト。
 */
export function render(data: MainLayoutData): string {
  const { content, pageTitle, page } = data;
  const relativeUrl = escapeHtml(relativeUrlFilter(page.url));
  const escapedPageTitle = escapeHtml(pageTitle);
  const canonicalUrl = escapeHtml(`${constants.siteUrlStem}${page.url}`);

  const prerender = ['/'].includes(page.url) ? `<link rel="prerender" href="${relativeUrl}hot/">` : '';

  const googleSiteVerification = constants.googleSiteVerification
    ? `<meta name="google-site-verification" content="${escapeHtml(constants.googleSiteVerification)}" />`
    : '';

  const globalSiteTag = constants.globalSiteTagKey
    ? `<!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(constants.globalSiteTagKey)}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          gtag('js', new Date());

          gtag('config', '${escapeHtml(constants.globalSiteTagKey)}');
        </script>`
    : '';

  const howToAddSite = constants.howToAddSiteLink
    ? `<p class='ui-text-note'>
                        追加したいブログがある場合は<br>
                        <a href='${escapeHtml(constants.howToAddSiteLink)}' target="_blank" rel="noopener noreferrer">サイトの追加方法</a>
                        をご参照ください。
                    </p>`
    : '';

  return `<!doctype html>
<html lang="ja">
<head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name='description' content='${escapeHtml(constants.siteDescription)}'>
    <meta name="author" content="${escapeHtml(constants.author)}">
    <meta name="robots" content="index, follow">

    <meta property="og:url" content="${escapeHtml(constants.siteUrl)}" />
    <meta property="og:title" content="${escapedPageTitle}" />
    <meta property="og:image" content="${escapeHtml(constants.siteUrl)}images/og-image.png" />
    <meta property="og:description" content="${escapeHtml(constants.siteDescription)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(constants.siteTitle)}" />
    <meta property="og:locale" content="ja_JP">

    <meta name="twitter:card" content="summary">
    <meta property="twitter:domain" content="${escapeHtml(constants.siteUrl)}">
    <meta property="twitter:url" content="${escapeHtml(constants.siteUrl)}">
    <meta name="twitter:title" content="${escapedPageTitle}">
    <meta name="twitter:description" content="${escapeHtml(constants.siteDescription)}">
    <meta name="twitter:image" content="${escapeHtml(constants.siteUrl)}images/og-image.png">

    <meta name="thumbnail" content="${escapeHtml(constants.siteUrl)}images/og-image.png" />

    <link rel="canonical" href="${canonicalUrl}">
    <link rel="preload" href="${relativeUrl}styles/bundle.css" as="style">
    ${prerender}

    ${googleSiteVerification}

    <link rel="shortcut icon" href="${relativeUrl}images/favicon.ico">
    <link rel="apple-touch-icon" href="${relativeUrl}images/apple-icon.png">
    <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="${relativeUrl}feeds/atom.xml" />
    <link rel="alternate" type="application/rss+xml" title="RSS2.0" href="${relativeUrl}feeds/rss.xml" />
    <link rel="alternate" type="application/json" href="${relativeUrl}feeds/feed.json" />

    <link rel="stylesheet" type="text/css" href="${relativeUrl}styles/bundle.css" />

    ${globalSiteTag}

    <title>${escapedPageTitle}</title>
</head>
<body>

    <header role="banner" class="ui-section-header">
        <div class="ui-layout-container">
            <div class="ui-section-header__layout ui-layout-flex">
                <a href="${escapeHtml(constants.siteUrl)}" role="link">
                    <img src="${relativeUrl}images/icon.png" alt='サイトロゴ' loading="eager" width='96' height='96' />
                    <span class='ui-section-header__title'>${escapeHtml(constants.siteTitle)}</span>
                </a>
                <div class="ui-section-header__links">
                    <a href="${escapeHtml(constants.gitHubRepositoryUrl)}" role="link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                        <img src='${relativeUrl}images/icon-github.png' alt='GitHubロゴ' loading="eager" width='96' height='96' />
                    </a>
                    <a href="${escapeHtml(constants.xUserUrl)}" role="link" aria-label="X" target="_blank" rel="noopener noreferrer">
                        <img src='${relativeUrl}images/icon-x.png' alt='Xロゴ' loading="eager" width='96' height='96' />
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main role="main">
        ${content}
    </main>

    <footer role="contentinfo" class="ui-section-footer">
        <div class="ui-layout-container">
            <div class="ui-layout-column-6 ui-layout-column-center">
                <div class="ui-component-cta ui-layout-flex ui-section-footer__site-info">
                    <p class="ui-text-note">
                        このサイトは<br>記事を読んでその企業の技術・カルチャーを知れることや<br>質の高い技術情報を得られることを目的としています。
                    </p>
                    ${howToAddSite}
                </div>
            </div>
        </div>
        <div class="ui-layout-container">
            <div class="ui-section-footer__layout ui-layout-flex">
                <p class="ui-section-footer--copyright ui-text-note">
                    <a class="ui-text-note" href='${escapeHtml(constants.gitHubUserUrl)}' target="_blank" rel="noopener noreferrer"><small>@${escapeHtml(constants.author)}</small></a>
                </p>
                <a href="${escapeHtml(constants.gitHubRepositoryUrl)}" role="link" class="ui-text-note" target="_blank" rel="noopener noreferrer"><small>GitHub</small></a>
            </div>
        </div>
    </footer>

    <script>
    ${relativeTimeScript}
    </script>

</body>
</html>`;
}
