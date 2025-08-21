module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Reguli de bază
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Reguli pentru Node.js
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    
    // Reguli pentru import/export
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    
    // Reguli pentru funcții
    'func-names': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off',
    
    // Reguli pentru obiecte
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': 'error',
    
    // Reguli pentru array-uri
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': 'off',
    
    // Reguli pentru string-uri
    'template-curly-spacing': ['error', 'never'],
    
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
    'max-len': ['error', {
      code: 120,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    
    // Reguli pentru complexity
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 300],
    'max-lines-per-function': ['warn', 50],
    'max-params': ['warn', 4],
    
    // Reguli pentru securitate
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Reguli pentru MongoDB
    'no-underscore-dangle': ['error', {
      allow: ['_id', '__v', '_doc'],
    }],
    
    // Reguli pentru Express
    'no-unused-expressions': ['error', {
      allowShortCircuit: true,
      allowTernary: true,
    }],
    
    // Reguli pentru JWT
    'camelcase': ['error', {
      properties: 'never',
      ignoreDestructuring: true,
    }],
    
    // Reguli pentru logging
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
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
  ],
  plugins: [
    'jest',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
}; 