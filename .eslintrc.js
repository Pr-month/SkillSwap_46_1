module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['unused-imports', '@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'prisma/seeds/*.ts', 'dist/**'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    'prefer-const': 'warn',
    'object-shorthand': 'warn',
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'typeParameter', format: ['PascalCase'] },
      {
        selector: 'interface',
        format: ['PascalCase'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.resolver.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
      },
    },
    {
      files: ['*.entity.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'class',
            format: ['PascalCase'],
            suffix: ['Entity', 'Response'],
          },
        ],
      },
    },
    {
      files: ['*.input.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'class',
            format: ['PascalCase'],
            suffix: ['Input'],
          },
        ],
      },
    },
    {
      files: ['src/**/entities/*.entity.ts', 'src/**/entities/*.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};
