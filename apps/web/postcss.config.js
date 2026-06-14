module.exports = {
  plugins: {
    // Inline @import (e.g. purbio's token stylesheet) BEFORE Tailwind runs, so
    // the @tailwind directives + tokens are seen as one file.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
