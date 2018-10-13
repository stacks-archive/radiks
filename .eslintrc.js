module.exports = {
  extends: "airbnb-base",
  parser: "babel-eslint",
  env: {
    browser: true,
  },
  rules: {
    "import/prefer-default-export": [0],
    "no-underscore-dangle": [0],
  }
};