const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    settings: {
      // react-native-dotenv exposes @env at bundle time, so the import
      // resolver cannot see it on disk.
      'import/core-modules': ['@env'],
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['__tests__/**', 'jest.setup.js'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
    },
  },
]);
