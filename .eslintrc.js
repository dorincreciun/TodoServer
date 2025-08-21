module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Reguli de bază
    indent: 'off', // Dezactivat pentru Prettier
    'linebreak-style': ['error', 'unix'],
    quotes: 'off', // Dezactivat pentru Prettier
    semi: 'off', // Dezactivat pentru Prettier

    // Reguli pentru Node.js
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // Reguli pentru import/export
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',

    // Reguli pentru funcții
    'func-names': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^(_|next)$' }],

    // Reguli pentru obiecte
    'object-curly-spacing': 'off', // Dezactivat pentru Prettier
    'object-shorthand': 'error',

    // Reguli pentru array-uri
    'array-bracket-spacing': 'off', // Dezactivat pentru Prettier
    'array-element-newline': 'off',

    // Reguli pentru string-uri
    'template-curly-spacing': 'off', // Dezactivat pentru Prettier

    // Reguli pentru variabile
    'no-var': 'error',
    'prefer-const': 'error',
    'no-use-before-define': ['error', { functions: false, classes: true }],

    // Reguli pentru control flow
    'no-else-return': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-continue': 'off',

    // Reguli pentru async/await
    'no-await-in-loop': 'off',

    // Reguli pentru max length
    'max-len': 'off', // Dezactivat pentru Prettier

    // Reguli pentru complexity
    complexity: 'off',
    'max-depth': ['warn', 4],
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'max-params': ['warn', 4],

    // Reguli pentru securitate
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Reguli pentru MongoDB
    'no-underscore-dangle': 'off',

    // Reguli pentru Express
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],

    // Reguli pentru JWT
    camelcase: [
      'error',
      {
        properties: 'never',
        ignoreDestructuring: true,
      },
    ],

    // Reguli relaxate pentru a reduce zgomotul în proiect
    'consistent-return': 'off',
    radix: 'off',
    'no-useless-catch': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-case-declarations': 'off',
    'default-case': 'off',
    'global-require': 'off',
    'no-mixed-operators': 'off',
    'no-return-await': 'off',
    'no-shadow': 'off',

    // Reguli de formatare dezactivate pentru Prettier
    'arrow-parens': 'off',
    'comma-dangle': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'newline-per-chained-call': 'off',

    // Reguli pentru testing
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-unused-expressions': 'off',
        'no-underscore-dangle': 'off',
      },
    },
    {
      files: ['config/**/*.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['scripts/mongo-init.js'],
      globals: {
        db: 'readonly',
        print: 'readonly',
      },
      rules: {
        'no-restricted-globals': 'off',
        'no-undef': 'off',
        'no-console': 'off',
        'no-global-assign': 'off',
      },
    },
    {
      files: ['scripts/**/*.js'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
  plugins: ['jest'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
};
