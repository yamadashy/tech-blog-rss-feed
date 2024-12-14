import * as crypto from 'node:crypto';
import * as v8 from 'node:v8';
import { to } from 'await-to-js';
import axios from 'axios';

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
  // biome-ignore lint/suspicious/noControlCharactersInRegex: This is intentional
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};

export const isValidHttpUrl = (url: string) => {
  let urlObject: URL;

  try {
    urlObject = new URL(url);
  } catch {
    return false;
  }

  return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
};

export const exponentialBackoff = async <A>(
  retrier: (attemptCount: number) => Promise<A>,
  baseWaitMs = 1000,
  retries = 3,
) => {
  let attemptLimitReached = false;
  let attemptCount = 0;

  // 引数ミス防止
  if (retries > 10) {
    throw new Error('retries が 10 を超えています');
  }

  while (!attemptLimitReached) {
    const [error, result] = await to(retrier(attemptCount));
    if (error) {
      attemptCount++;
      attemptLimitReached = attemptCount > retries;

      if (attemptLimitReached) {
        throw error;
      }
      const waitTime = 2 ** attemptCount * baseWaitMs;
      await sleep(waitTime);
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
