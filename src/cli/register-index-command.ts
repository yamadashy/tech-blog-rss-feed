import { google } from 'googleapis';
import constants from '../common/constants';
import { sleep } from '../feed/common-util';
import type { BlogFeed } from '../feed/feed-storer';
const key = require('../../storage/service_account.json');
let blogFeeds: BlogFeed[] = require('../site/blog-feeds/blog-feeds.json');

const GOOGLE_INDEXING_API_END_POINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const INDEXING_LIMIT = 200;

// ソート
blogFeeds = blogFeeds.sort((a, b) => {
  const aLastUpdated = a.items[0]?.isoDate;
  const bLastUpdated = b.items[0]?.isoDate;

  if (!aLastUpdated) {
    return 1;
  }
  if (!bLastUpdated) {
    return -1;
  }

  return -1 * aLastUpdated.localeCompare(bLastUpdated);
});

const indexTargetUrls = blogFeeds.slice(0, INDEXING_LIMIT).map((blogFeed) => {
  return `${constants.siteUrlStem}/blogs/${blogFeed.linkMd5Hash}/`;
});

const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/indexing'],
});

jwtClient.authorize(async (err, tokens) => {
  if (err) {
    console.error(err);
    return;
  }
  if (!tokens) {
    console.error('missing token');
    return;
  }

  for (const indexTargetUrl of indexTargetUrls) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.access_token || ''}`,
      },
      body: JSON.stringify({
        url: indexTargetUrl,
        type: 'URL_UPDATED',
      }),
    };

    try {
      const response = await fetch(GOOGLE_INDEXING_API_END_POINT, options);
      if (!response.ok) {
        console.error(response.status, await response.text());
        continue;
      }
      const body = await response.json();
      console.log(`[index api] success! url: ${body.urlNotificationMetadata.url}`);
    } catch (error) {
      console.error(error);
    }

    await sleep(1000);
  }
});
