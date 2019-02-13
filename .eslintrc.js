module.exports = {
  extends: "airbnb-base",
  parser: "babel-eslint",
  env: {
    browser: true,
    "jest/globals": true
  },
  rules: {
    "import/prefer-default-export": [0],
    "no-underscore-dangle": [0],
    "class-methods-use-this": [0]
  },
  plugins: [
    'jest'
  ]
};