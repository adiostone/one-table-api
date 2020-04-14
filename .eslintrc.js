module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  rules: {
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    indent: ['error', 2, { ignoredNodes: ['ConditionalExpression'] }],
    'no-console': process.env.APP_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.APP_ENV === 'production' ? 'error' : 'off',
    'require-atomic-updates': 'off' // See https://github.com/eslint/eslint/issues/11899
  }
}
