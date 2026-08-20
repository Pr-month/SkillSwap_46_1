// .eslintrc.cjs
module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:storybook/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['@typescript-eslint', 'react-refresh'],
    env: {
        browser: true,
        es2020: true,
    },
    rules: {
        'react-refresh/only-export-components': 'off',
    },
    ignorePatterns: ['dist', '.eslintrc.cjs'],
};