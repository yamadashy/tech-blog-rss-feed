import type EleventyImage from '@11ty/eleventy-img';
import constants from './constants.js';

export const imageCacheOptions: EleventyImage.CacheOptions = {
  duration: '3d',
  type: 'buffer',
  fetchOptions: {
    headers: {
      'User-Agent': constants.requestUserAgent,
    },
  },
};
