import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'reports/**', '_site/**'] },
  js.configs.recommended,
  {
    files: ['assets/js/*.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
    rules: { 'no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_' }] }
  },
  {
    files: ['*.mjs', 'scripts/*.mjs'],
    languageOptions: { globals: globals.node }
  }
];
