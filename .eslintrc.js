/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// ESLint configuration
// http://eslint.org/docs/user-guide/configuring
export default {
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'prettier'
  ],

  plugins: ['prettier', 'import'],

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },

  env: {
    node: true,
    es2022: true,
    jest: true
  },

  rules: {
    'import/extensions': ['error', 'always', { ignorePackages: true }],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'prettier/prettier': ['error'],
    'import/prefer-default-export': 'off'
  },

  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
};
