const util = require('util');
const sass = require('sass'); // `npm i -D sass`
const renderSass = util.promisify(sass.render);
const inputFile = 'src/static/css/site.scss'; // the path to your main SCSS file
const outputFile = '/static/css/site.css'; // the filename you want this template to be saved as

const purgecss = require('@fullhuman/postcss-purgecss');

const postcss = require('postcss');

module.exports = class {
  async data() {
    return {
      permalink: outputFile,
      eleventyExcludeFromCollections: true,
    };
  }

  async render() {
    const result = await renderSass({
      file: inputFile,
    });

    return await postcss([
      require('postcss-nested'),
      purgecss({
        content: ['./src/**/*.njk', './src/**/*.md'],
        safelist: {
          deep: [/mx-0/],
        },
      }),
      require('autoprefixer'),
      require('cssnano'),
    ])
      .process(result.css, { from: undefined })
      .then((result) => result.css);
  }
};
