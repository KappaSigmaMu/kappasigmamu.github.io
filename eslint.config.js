const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = [
  {
    ignores: ['**/*.d.ts', 'src/canary-component/**', 'eslint.config.js', '.eslintrc.js'],
  },
  ...compat.config(require('./.eslintrc.js')),
]
