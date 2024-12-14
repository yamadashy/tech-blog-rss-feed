import path from 'node:path';
import url from 'node:url';
import EleventyFetch from '@11ty/eleventy-fetch';
import EleventyImage from '@11ty/eleventy-img';
import CleanCSS from 'clean-css';
import htmlmin from 'html-minifier-terser';
import sharpIco, { type ImageData } from 'sharp-ico';
import ts from 'typescript';
import constants from './constants';
import { imageCacheOptions } from './eleventy-cache-option';

export const imageThumbnailShortcode = async (src: string, alt: string, pathPrefix = '', imageLoading = 'lazy') => {
  // 取れなければ代替画像
  const alternativeImageTag = `<img src='${pathPrefix}images/alternate-feed-image.png' alt='${alt}' loading='lazy' width='256' height='256'>`;

  if (!src) {
    return alternativeImageTag;
  }

  let metadata: EleventyImage.Metadata;

  try {
    metadata = await EleventyImage(src, {
      widths: [256, 512],
      formats: ['avif', 'jpeg'],
      outputDir: 'public/images/feed-thumbnails',
      urlPath: `${pathPrefix}images/feed-thumbnails/`,
      cacheOptions: imageCacheOptions,
      sharpAvifOptions: {
        quality: 35,
        effort: 4,
      },
      sharpJpegOptions: {
        quality: 70,
      },
      concurrency: constants.eleventyFetchConcurrency,
    });
  } catch {
    // エラーが起きたら代替画像にする
    console.log('[image-thumbnail-short-code] error', src);
    return alternativeImageTag;
  }

  return EleventyImage.generateHTML(metadata, {
    alt,
    sizes: '(min-width: 75rem) 16rem, (min-width: 64rem) 19rem, (min-width: 48rem) 19rem, 8rem',
    loading: imageLoading,
  });
};

export const imageIconShortcode = async (src: string, alt: string, pathPrefix = '', imageLoading = 'lazy') => {
  // 取れなければ画像なし
  const alternativeImageTag = '';

  if (!src) {
    return alternativeImageTag;
  }

  if (src.startsWith('data:')) {
    return `<img src='${src}' alt='${alt}' loading='lazy' width='16' height='16'>`;
  }

  const parsedUrl = url.parse(src);
  const fileName = path.basename(parsedUrl.pathname || '');
  const fileExtension = path.extname(fileName).toLowerCase();
  let imageSrc: EleventyImage.ImageSource = src;
  let metadata: EleventyImage.Metadata;

  if (fileExtension === '.ico') {
    try {
      const icoBuffer = await EleventyFetch(src, {
        type: 'buffer',
        duration: imageCacheOptions.duration,
        concurrency: constants.eleventyFetchConcurrency,
      });
      const sharpIcoImages = (await sharpIco.sharpsFromIco(icoBuffer, {}, true)) as ImageData[];
      const sharpIcoImage = sharpIcoImages.sort((a, b) => b.width - a.width)[0];
      if (sharpIcoImage.image) {
        imageSrc = await sharpIcoImage.image.png().toBuffer();
      }
    } catch (error) {
      console.error('[image-icon-short-code] Error processing ICO:', src, error);
      return alternativeImageTag;
    }
  }

  try {
    metadata = await EleventyImage(imageSrc, {
      widths: [16],
      formats: ['png'],
      outputDir: 'public/images/feed-icons',
      urlPath: `${pathPrefix}images/feed-icons/`,
      cacheOptions: imageCacheOptions,
      sharpPngOptions: {
        quality: 50,
      },
    });
  } catch (error) {
    // エラーが起きたら画像なし
    console.log('[image-icon-short-code] Error processing image', src, error);
    return '';
  }

  return EleventyImage.generateHTML(metadata, {
    alt,
    loading: imageLoading,
  });
};

export const minifyHtmlTransform = (content: string, outputPath: string) => {
  if (outputPath?.endsWith('.html')) {
    return htmlmin.minify(content, {
      // オプション参考: https://github.com/terser/html-minifier-terser#options-quick-reference
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      maxLineLength: 1000,
    });
  }

  return content;
};

export const relativeUrlFilter = (url: string) => {
  const relativeUrl = path.relative(url, '/');
  return relativeUrl === '' ? './' : `${relativeUrl}/`;
};

export const minifyCssFilter = (css: string) => {
  return new CleanCSS({}).minify(css).styles;
};

// biome-ignore lint/suspicious/noExplicitAny: This is intentional
export const supportTypeScriptTemplate = (eleventyConfig: any) => {
  eleventyConfig.addTemplateFormats('ts');
  eleventyConfig.addExtension('ts', {
    outputFileExtension: 'js',
    compile: async (inputContent: string) => {
      return async () => {
        const result = ts.transpileModule(inputContent, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
        return result.outputText;
      };
    },
  });
};
