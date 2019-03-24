module.exports = {
  extends: ["airbnb-base", "plugin:@typescript-eslint/recommended"],
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
    "spaced-comment": [0],
    "@typescript-eslint/indent": [
      2,
      2,
      {
        FunctionDeclaration: { parameters: "first" },
        FunctionExpression: { parameters: "first" },
        ObjectExpression: "first",
        ArrayExpression: "first",
        ImportDeclaration: "first",
        CallExpression: { arguments: "first" }
      }
    ],
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/member-delimiter-style": "off"
  },
  plugins: ["jest", "import", "@typescript-eslint"],
  settings: {
    "import/resolver": {
      // use <root>/tsconfig.json
      typescript: {}
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    }
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "no-unused-vars": ["off"]
      }
    }
  ]
};