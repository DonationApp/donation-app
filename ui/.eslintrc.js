module.exports = {
  extends: ['eslint:recommended', 'google'],
  env: {
    browser: true,
  },
  plugins: [
    'html',
  ],
  rules: {
    'no-var': 'off',
    'new-cap': ['error', { 'capIsNewExceptions': ['Polymer'] }],
  },
  globals: {
    Polymer: false,
    app: false,
  },
};
