import * as request from 'request';
import { google } from 'googleapis';
import { BlogFeed } from './utils/feed-storer';
import * as constants from '../common/constants';
import { sleep } from './utils/common-util';
const key = require('../../storage/service_account.json');
const blogFeeds: BlogFeed[] = require('../site/blog-feeds/blog-feeds.json');

const indexTargetUrls = blogFeeds.map((blogFeed) => {
  return `${constants.siteUrlStem}/${blogFeed.linkMd5Hash}/`;
});
const GOOGLE_INDEXING_API_END_POINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

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
    const options: request.CoreOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      auth: { bearer: tokens.access_token || '' },
      json: {
        url: indexTargetUrl,
        type: 'URL_UPDATED',
      },
    };

    await request.post(GOOGLE_INDEXING_API_END_POINT, options, async (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
      if (response.statusCode !== 200) {
        console.error(response.statusCode, body);
        return;
      }

      console.log('[index api] success! url: ' + body.urlNotificationMetadata.url);
    });

    await sleep(1000);
  }
});
