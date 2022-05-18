import * as v8 from 'v8';
import * as crypto from 'crypto';
import axios from 'axios';
import { to } from 'await-to-js';

export const objectDeepCopy = <T>(data: T): T => {
  // TODO: Node.js 17 以上にしたら structuredClone 使う
  return v8.deserialize(v8.serialize(data));
};

export const textToMd5Hash = (text: string): string => {
  const md5 = crypto.createHash('md5');
  return md5.update(text, 'binary').digest('hex');
};

export const textTruncate = (text: string, maxLength: number, postFix: string): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + postFix : text;
};

export const urlRemoveQueryParams = (url: string) => {
  if (!url.includes('?')) {
    return url;
  }

  return url.split('?')[0];
};

export const isValidHttpUrl = (url: string) => {
  let urlObject;

  try {
    urlObject = new URL(url);
  } catch (_) {
    return false;
  }

  return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
};

export const backoff = async <A>(retrier: () => Promise<A>, retries = 3) => {
  let attemptLimitReached = false;
  let attemptNumber = 0;

  while (!attemptLimitReached) {
    const [error, result] = await to(retrier());
    if (error) {
      attemptNumber++;
      attemptLimitReached = attemptNumber > retries;

      if (attemptLimitReached) {
        throw error;
      }
    } else {
      return result;
    }
  }

  throw new Error('Something went wrong.');
};

export const fetchHatenaCountMap = async (urls: string[]): Promise<{ [key: string]: number }> => {
  const params = urls.map((url) => `url=${url}`).join('&');
  const response = await axios.get(`https://bookmark.hatenaapis.com/count/entries?${params}`);
  return response.data;
};

export const sleep = (waitTime: number) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, waitTime);
  });
};
