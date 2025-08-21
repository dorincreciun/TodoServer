module.exports = {
  '*.js': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.json': [
    'prettier --write',
  ],
  '*.md': [
    'prettier --write',
  ],
  '*.{yml,yaml}': [
    'prettier --write',
  ],
}; 