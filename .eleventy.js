const htmlmin = require('html-minifier-terser');
const Image = require('@11ty/eleventy-img');
const path = require('path');

Image.concurrency = 50;

const minifyHtmlTransform = (content, outputPath) => {
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

const imageShortcode = async (src, alt, pathPrefix = '') => {
  let metadata = null;

  try {
    metadata = await Image(src, {
      widths: [150, 450],
      formats: ["webp", "jpeg"],
      outputDir: 'public/images/feed-thumbnails',
      urlPath: `${pathPrefix}images/feed-thumbnails/`,
      cacheOptions: {
        duration: '3d',
        fetchOptions: {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
          },
        },
      },
      sharpWebpOptions: {
        quality: 50,
      },
      sharpJpegOptions: {
        quality: 70,
      }
    });
  } catch (e) {
    // エラーが起きたら代替画像にする
    console.log('[image-short-code] error', src);
    return `<img src='${pathPrefix}images/icon256-transparent.png' alt='${alt}' loading='lazy' decoding='async'>`
  }

  return Image.generateHTML(metadata, {
    alt,
    sizes: '100vw',
    loading: 'lazy',
    decoding: 'async',
  });
}

const relativeUrlFilter = (url) => {
  const relativeUrl = path.relative(url, '/');
  return relativeUrl === '' ? './' : `${relativeUrl}/`;
}

module.exports = function (eleventyConfig) {
  // static assets
  eleventyConfig.addPassthroughCopy('src/site/images');
  eleventyConfig.addPassthroughCopy('src/site/feeds');

  // images
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);

  // minify
  eleventyConfig.addTransform('minify html', minifyHtmlTransform);

  // relative path
  eleventyConfig.addFilter("relativeUrl", relativeUrlFilter);

  return {
    htmlTemplateEngine: 'njk',

    dir: {
      input: 'src/site',
      output: 'public'
    }
  }
}
