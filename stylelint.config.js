module.exports = {
  ignoreFiles: './public/**',
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ],
  customSyntax: 'postcss-scss',
  rules: {
    'block-no-empty': null,
    'string-quotes': 'single',
    'color-no-invalid-hex': true,
    'comment-whitespace-inside': 'always',
    'no-invalid-double-slash-comments': true,
    'declaration-bang-space-after': 'never',
    'declaration-block-semicolon-newline-after': 'always',
    indentation: [2],
    'max-empty-lines': 1
  }
};
