'use strict';

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/warnings',
    'plugin:import/errors',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'warn',

    // plugin import
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',

    '@typescript-eslint/no-var-requires': 'off',
  },
  overrides: [
    // TypeScript系ファイルへのルールを設定
    {
      files: ['**/*.js'],
      extends: ['eslint:recommended'],
    },
  ],
};
