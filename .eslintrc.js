module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Customize rules as needed
    'no-console': 'off', // Allow console for logging
    'no-underscore-dangle': ['error', { allow: ['_id', '_validateId', '_validatePagination', '_buildOdooFilters', '_isValidEmail', '_isValidPhone', '_authenticateWithRetry', '_sleep', '_createConnection', '_waitForConnection', '_setIdleTimeout'] }],
    'class-methods-use-this': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'consistent-return': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js'] }],
    'max-classes-per-file': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-param-reassign': ['error', { props: false }]
  }
};
