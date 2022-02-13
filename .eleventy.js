const htmlmin = require('html-minifier-terser');
const Image = require('@11ty/eleventy-img');

Image.concurrency = 20;

const minifyHtmlTransform = function (content, outputPath) {
  if(outputPath && outputPath.endsWith('.html')) {
    return htmlmin.minify(content,  {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      maxLineLength: 200
    });
  }

  return content;
}

const imageShortcode = async function (src, alt, sizes) {
  let metadata = null;

  try {
    metadata = await Image(src, {
      widths: [300, 600],
      formats: ['jpeg'],
      outputDir: 'public/images/feed-thumbnails',
      urlPath: 'images/feed-thumbnails/'
    });
  } catch (e) {
    // エラーが起きたらそのまま使う
    return `<img src='${src}' alt='${alt}' loading='lazy' decoding='async'>`
  }

  return Image.generateHTML(metadata, {
    alt,
    sizes,
    loading: 'lazy',
    decoding: 'async',
  });
}

module.exports = function (eleventyConfig) {
  // static assets
  eleventyConfig.addPassthroughCopy('src/site/images');
  eleventyConfig.addPassthroughCopy('src/site/feeds');

  // images
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);

  // minify
  eleventyConfig.addTransform('minify html', minifyHtmlTransform);

  return {
    htmlTemplateEngine: 'njk',

    dir: {
      input: 'src/site',
      output: 'public'
    }
  }
}
