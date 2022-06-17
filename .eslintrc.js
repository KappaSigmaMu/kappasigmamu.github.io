module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  settings: { react: { version: 'detect' }},
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import'
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended'
  ],
  root: true,
  env: {
    jest: true,
    node: true,
  },
  overrides: [{
    files: ["**/*.tsx"],
    rules: {
        "react/prop-types": "off"
    }
  }],
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
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
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
    'react/react-in-jsx-scope': 'off',
    'semi': ['error', 'never'],
  },
};
