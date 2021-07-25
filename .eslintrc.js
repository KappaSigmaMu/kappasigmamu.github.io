module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    // 'plugin:react/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'semi': ['error', 'never'],
    'no-multiple-empty-lines': ['warn', { max: 1 }],
    'no-import-assign': 'warn',
    'no-duplicate-imports': 'warn',
    'no-useless-rename': 'warn',
    'object-shorthand': 'warn',
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/member-ordering': 'warn',
    '@typescript-eslint/explicit-member-accessibility': [
      'warn',
      { overrides: { constructors: 'no-public' } },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        'selector': 'interface',
        'format': ['PascalCase'],
      }
    ],
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
    'import/newline-after-import': ['warn'],
    'import/no-default-export': ['warn'],
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'prettier/prettier': 'warn'
  },
};
