const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = [
  {
    // src/pages/game/**: three.js code kept out of the typed graph (see tsconfig exclude and
    // src/pages/game/CanaryStage.d.ts). The type-aware lint rules need a tsconfig project,
    // so a file excluded there cannot be linted here either -- same as canary-component.
    ignores: [
      '**/*.d.ts',
      'src/canary-component/**',
      'src/pages/game/**',
      'eslint.config.js',
      '.eslintrc.js',
    ],
  },
  ...compat.config(require('./.eslintrc.js')),
]
