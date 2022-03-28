module.exports = {
  extends: [require.resolve('@vercel/style-guide/eslint/node')],
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
