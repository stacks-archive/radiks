module.exports = {
  extends: "airbnb-base",
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    "jest/globals": true
  },
  rules: {
    "import/prefer-default-export": [0],
    "no-underscore-dangle": [0],
    "class-methods-use-this": [0],
    "import/no-cycle": [0],
    "lines-between-class-members": [0],
    "spaced-comment": [0]
  },
  plugins: [
    'jest',
    'import',
    '@typescript-eslint'
  ],
  settings: {
    "import/resolver": {
      // use <root>/tsconfig.json
      "typescript": {},
    }
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "rules": {
        "no-unused-vars": ["off"]
      }
    }
  ]
};