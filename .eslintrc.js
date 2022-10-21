module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: ['@nuxtjs', 'plugin:nuxt/recommended', 'prettier', 'plugin:storybook/recommended', 'plugin:storybook/recommended'],
  plugins: [],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multi-word-component-names': 'off',
    'no-prototype-builtins': 'off',
    'vue/no-mutating-props': 'warn',
    'vue/no-computed-properties-in-data': 'warn'
  }
};