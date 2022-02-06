const htmlmin = require("html-minifier-terser");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/site/images");
  eleventyConfig.addPassthroughCopy("src/site/feeds");
  eleventyConfig.addTransform("minify html", function(content, outputPath) {
    if(outputPath && outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        maxLineLength: 200
      });
    }

    return content;
  });

  return {
    htmlTemplateEngine: 'njk',

    dir: {
      input: "src/site",
      output: "public"
    }
  }
}
