import * as v8 from 'v8';
import * as crypto from 'crypto';
import axios from 'axios';
import { to } from 'await-to-js';

type HatenaCountMap = Record<string, number>;

export const objectDeepCopy = <T>(data: T): T => {
  // TODO: Node.js 17 以上にしたら structuredClone 使う
  return v8.deserialize(v8.serialize(data));
};

export const textToMd5Hash = (text: string): string => {
  const md5 = crypto.createHash('md5');
  return md5.update(text, 'binary').digest('hex');
};

export const textTruncate = (text: string, maxLength: number): string => {
  return Array.from(text).slice(0, maxLength).join('');
};

export const urlRemoveQueryParams = (url: string) => {
  if (!url.includes('?')) {
    return url;
  }

  return url.split('?')[0];
};

export const removeInvalidUnicode = (text: string) => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};

export const escapeTextForXml = (text: string) => {
  if (text.includes('&')) {
    text = text.replace(/&/g, '&amp;');
  }

  return text;
};

export const isValidHttpUrl = (url: string) => {
  let urlObject;

  try {
    urlObject = new URL(url);
  } catch {
    return false;
  }

  return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
};

export const exponentialBackoff = async <A>(retrier: (attemptCount: number) => Promise<A>, retries = 3) => {
  let attemptLimitReached = false;
  let attemptCount = 0;

  while (!attemptLimitReached) {
    const [error, result] = await to(retrier(attemptCount));
    if (error) {
      attemptCount++;
      attemptLimitReached = attemptCount > retries;

      if (attemptLimitReached) {
        throw error;
      } else {
        const waitTime = Math.pow(2, attemptCount) * 1000;
        await sleep(waitTime);
      }
    } else {
      return result;
    }
  }

  throw new Error('Something went wrong.');
};

export const fetchHatenaCountMap = async (urls: string[]): Promise<HatenaCountMap> => {
  const params = urls.map((url) => `url=${url}`).join('&');
  const response = await axios.get<HatenaCountMap>(`https://bookmark.hatenaapis.com/count/entries?${params}`);
  return response.data;
};

export const sleep = (waitTime: number) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, waitTime);
  });
};
