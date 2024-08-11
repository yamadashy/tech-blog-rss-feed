import constants from './constants';
import EleventyImage from '@11ty/eleventy-img';

export const imageCacheOptions: EleventyImage.CacheOptions = {
  duration: '3d',
  type: 'buffer',
  fetchOptions: {
    headers: {
      'User-Agent': constants.requestUserAgent,
    },
  },
};
