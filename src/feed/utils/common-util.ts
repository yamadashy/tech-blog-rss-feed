import * as v8 from 'v8';
import * as crypto from 'crypto';

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
