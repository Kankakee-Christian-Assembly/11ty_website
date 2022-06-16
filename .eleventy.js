const Image = require('@11ty/eleventy-img');
const criticalCss = require('eleventy-critical-css');
const metagen = require('eleventy-plugin-metagen');
const fs = require('fs');
const schema = require('@quasibit/eleventy-plugin-schema');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
async function imageShortcode(
  src,
  alt,
  sizes,
  cls = '',
  loading = 'lazy',
  decoding = 'async',
) {
  let metadata = await Image(src, {
    widths: [24, 300, 400, 500, 600, 800],
    formats: ['webp'],
    outputDir: './_site/static/img/',
    urlPath: '/static/img/',
  });

  let imageAttributes = {
    class: cls,
    alt,
    sizes,
    loading: loading,
    decoding: decoding,
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget('./src/static/');
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);
  eleventyConfig.addTransform(
    'htmlmin',
    require('./src/_utils/minify-html.js'),
  );
  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPlugin(criticalCss);
  eleventyConfig.addPlugin(schema);

  // copy font
  eleventyConfig.addPassthroughCopy({
    './node_modules/@fontsource/gentium-book-basic/files':
      'static/font/gentium-book-basic/files',
  });

  // copy images
  eleventyConfig.addPassthroughCopy({
    'src/static/img': 'static/img',
  });

  // copy robots
  eleventyConfig.addPassthroughCopy({
    'src/robots.txt': 'robots.txt',
  });

  // eleventyConfig.addPassthroughCopy({
  //   'src/favicon.ico': 'favicon.ico',
  // });

  const mapping = {
    h1: 'title is-1',
    h2: 'title is-2',
    h3: 'title is-3',
    h4: 'title is-4',
    h5: 'title is-5',
    h6: 'title is-5',
    p: 'block',
    table: 'table',
    blockquote: 'notification mx-0',
  };

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        placement: 'before',
        class: 'direct-link',
        symbol: '∞',
        level: [2, 3, 4, 5],
      }),
      slugify: eleventyConfig.getFilter('slug'),
    })
    .use(require('@toycode/markdown-it-class'), mapping)
    .use(require('markdown-it-div'), 'div', {})
    .use(require('markdown-it-imsize'), { autofill: true });

  eleventyConfig.setLibrary('md', markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    dir: {
      input: 'src',
      formats: 'njk',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['md', 'html', 'njk', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true,
  };
};
