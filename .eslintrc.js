module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  settings: { react: { version: 'detect' }},
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:react/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  root: true,
  env: {
    jest: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': [
      'warn',
      { overrides: { constructors: 'no-public' } },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/member-ordering': 'warn',
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        'selector': 'interface',
        'format': ['PascalCase'],
      }
    ],
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/newline-after-import': ['warn'],
    'import/no-default-export': ['warn'],
    'import/order': [
      'warn',
      {
        groups: ['external', 'builtin'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'max-len': ['warn', { 'code': 120 }],
    'no-duplicate-imports': 'warn',
    'no-import-assign': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 1 }],
    'no-useless-rename': 'warn',
    'object-shorthand': 'warn',
    'prettier/prettier': 'warn',
    'react/react-in-jsx-scope': 'off',
    'semi': ['error', 'never'],
  },
};
