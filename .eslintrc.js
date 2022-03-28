module.exports = {
  extends: [require.resolve('@vercel/style-guide/eslint/node')],
  overrides: [
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: [require.resolve('@vercel/style-guide/eslint/jest')],
      rules: {
        'jest/no-disabled-tests': 'off',
        'jest/expect-expect': 'off',
        'jest/no-conditional-expect': 'off',
      }
    },
  ],
  rules: {
    /* These rules are temporarily disabled.
       The TypeScript rewrite will resolve all outstanding issues. */
    'no-multi-assign': 'off',
    'no-param-reassign': 'off',
    'no-bitwise': 'off',
    camelcase: 'off',
    'func-names': 'off',
    eqeqeq: 'off',
  },
};
