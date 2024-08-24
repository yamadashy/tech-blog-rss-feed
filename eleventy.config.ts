import htmlmin from 'html-minifier-terser';
import EleventyImage from '@11ty/eleventy-img';
import EleventyFetch from "@11ty/eleventy-fetch";
import path from 'path';
import ts from 'typescript';
import { imageCacheOptions } from './src/common/eleventy-cache-option';
import CleanCSS from "clean-css";
import sharpIco, {ImageData} from "sharp-ico";
import url from 'url';
import Eleventy from '@11ty/eleventy';

const ELEVENTY_FETCH_CONCURRENCY = 50;

EleventyImage.concurrency = ELEVENTY_FETCH_CONCURRENCY;

const minifyHtmlTransform = (content: string, outputPath: string) => {
  if(outputPath && outputPath.endsWith('.html')) {
    return htmlmin.minify(content,  {
      // オプション参考: https://github.com/terser/html-minifier-terser#options-quick-reference
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      maxLineLength: 1000
    });
  }

  return content;
}

const imageThumbnailShortcode = async (src: string, alt: string, pathPrefix: string = '') => {
  // 取れなければ代替画像
  const alternativeImageTag = `<img src='${pathPrefix}images/alternate-feed-image.png' alt='${alt}' loading='lazy' width='256' height='256'>`;

  if (!src) {
    return alternativeImageTag;
  }

  let metadata: EleventyImage.Metadata;

  try {
    metadata = await EleventyImage(src, {
      widths: [150, 450],
      formats: ["webp", "jpeg"],
      outputDir: 'public/images/feed-thumbnails',
      urlPath: `${pathPrefix}images/feed-thumbnails/`,
      cacheOptions: imageCacheOptions,
      sharpWebpOptions: {
        quality: 50,
      },
      sharpJpegOptions: {
        quality: 70,
      }
    });
  } catch {
    // エラーが起きたら代替画像にする
    console.log('[image-thumbnail-short-code] error', src);
    return alternativeImageTag;
  }

  return EleventyImage.generateHTML(metadata, {
    alt,
    sizes: '100vw',
    loading: 'lazy',
    decoding: 'async',
  });
}

const imageIconShortcode = async (src: string, alt: string, pathPrefix: string = '') => {
  // 取れなければ画像なし
  const alternativeImageTag = ``;

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
        concurrency: ELEVENTY_FETCH_CONCURRENCY,
      });
      const sharpIcoImages = await sharpIco.sharpsFromIco(icoBuffer, {}, true) as ImageData[];
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
      formats: ["png"],
      outputDir: 'public/images/feed-icons',
      urlPath: `${pathPrefix}images/feed-icons/`,
      cacheOptions: imageCacheOptions,
      sharpPngOptions: {
        quality: 50,
      }
    });
  } catch (error) {
    // エラーが起きたら画像なし
    console.log('[image-icon-short-code] Error processing image', src, error);
    return ``
  }

  return EleventyImage.generateHTML(metadata, {
    alt,
    loading: 'lazy',
    decoding: 'async',
  });
}

const relativeUrlFilter = (url: string) => {
  const relativeUrl = path.relative(url, '/');
  return relativeUrl === '' ? './' : `${relativeUrl}/`;
}

const minifyCssFilter = (css: string) => {
  return new CleanCSS({}).minify(css).styles;
}

const supportTypeScriptTemplate = (eleventyConfig: Eleventy.UserConfig) => {
  eleventyConfig.addTemplateFormats('ts');
  eleventyConfig.addExtension('ts', {
    outputFileExtension: 'js',
    compile: async (inputContent: string) => {
      return async () => {
        const result = ts.transpileModule(inputContent, { compilerOptions: { module: ts.ModuleKind.CommonJS }});
        return result.outputText;
      }
    }
  });
}

module.exports = function (eleventyConfig: Eleventy.UserConfig) {
  // static assets
  eleventyConfig.addPassthroughCopy('src/site/images');
  eleventyConfig.addPassthroughCopy('src/site/feeds');

  // images
  eleventyConfig.addNunjucksAsyncShortcode('imageThumbnail', imageThumbnailShortcode);
  eleventyConfig.addNunjucksAsyncShortcode('imageIcon', imageIconShortcode);

  // minify html
  eleventyConfig.addTransform('minify html', minifyHtmlTransform);

  // relative path
  eleventyConfig.addFilter("relativeUrl", relativeUrlFilter);

  // minify css
  eleventyConfig.addFilter("minifyCss", minifyCssFilter);

  // TypeScript
  supportTypeScriptTemplate(eleventyConfig);

  // TODO: _data も TypeScript 対応したい
  // @see https://github.com/11ty/eleventy/discussions/1835

  return {
    htmlTemplateEngine: 'njk',

    dir: {
      input: 'src/site',
      output: 'public'
    }
  }
}
