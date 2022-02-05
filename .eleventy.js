const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( outputPath && outputPath.endsWith(".html") ) {
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
    templateFormats: ['njk', 'png', 'ico'],
    dir: {
      input: "src/site",
      output: "public"
    }
  }
}
