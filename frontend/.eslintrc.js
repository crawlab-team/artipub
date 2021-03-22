module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-continue': 'off',
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['d', '_d', 't', '_t'] },
    ],
    // "no-unused-vars": ["warn"],
  },
};
