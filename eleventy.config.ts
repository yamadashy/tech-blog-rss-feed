import EleventyImage from '@11ty/eleventy-img';
import constants from './src/common/constants';
import {
  imageIconShortcode,
  imageThumbnailShortcode,
  minifyCssFilter,
  minifyHtmlTransform,
  relativeUrlFilter,
  supportTypeScriptTemplate,
} from './src/common/eleventy-utils';

EleventyImage.concurrency = constants.eleventyFetchConcurrency;

// biome-ignore lint/suspicious/noExplicitAny: This is intentional
module.exports = (eleventyConfig: any) => {
  // static assets
  eleventyConfig.addPassthroughCopy('src/site/images');
  eleventyConfig.addPassthroughCopy('src/site/feeds');

  // images
  eleventyConfig.addNunjucksAsyncShortcode('imageThumbnail', imageThumbnailShortcode);
  eleventyConfig.addNunjucksAsyncShortcode('imageIcon', imageIconShortcode);

  // minify html
  eleventyConfig.addTransform('minify html', minifyHtmlTransform);

  // relative path
  eleventyConfig.addFilter('relativeUrl', relativeUrlFilter);

  // minify css
  eleventyConfig.addFilter('minifyCss', minifyCssFilter);

  // TypeScript
  supportTypeScriptTemplate(eleventyConfig);

  // TODO: _data も TypeScript 対応したい
  // @see https://github.com/11ty/eleventy/discussions/1835

  return {
    htmlTemplateEngine: 'njk',

    dir: {
      input: 'src/site',
      output: 'public',
    },
  };
};
