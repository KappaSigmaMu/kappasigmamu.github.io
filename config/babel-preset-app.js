'use strict';

const path = require('path');

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === 'undefined') {
    value = defaultValue;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`babel-preset-app: '${name}' option must be a boolean.`);
  }

  return value;
};

module.exports = function (api, opts = {}) {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const isEnvTest = env === 'test';

  const isFlowEnabled = validateBoolOption('flow', opts.flow, true);
  const isTypeScriptEnabled = validateBoolOption('typescript', opts.typescript, true);
  const useAbsoluteRuntime = validateBoolOption('absoluteRuntime', opts.absoluteRuntime, true);

  let absoluteRuntimePath;
  if (useAbsoluteRuntime) {
    absoluteRuntimePath = path.dirname(require.resolve('@babel/runtime/package.json'));
  }

  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      'Using `babel-preset-app` requires that you specify `NODE_ENV` or ' +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(env) +
        '.'
    );
  }

  const jsxRuntime = opts.runtime === 'classic' ? 'classic' : 'automatic';

  return {
    assumptions: {
      setPublicClassFields: true,
      privateFieldsAsProperties: true,
    },
    presets: [
      isEnvTest && [
        require('@babel/preset-env').default,
        {
          targets: { node: 'current' },
          exclude: ['transform-typeof-symbol'],
        },
      ],
      (isEnvProduction || isEnvDevelopment) && [
        require('@babel/preset-env').default,
        {
          exclude: ['transform-typeof-symbol'],
        },
      ],
      [
        require('@babel/preset-react').default,
        {
          development: isEnvDevelopment || isEnvTest,
          runtime: jsxRuntime,
          ...(jsxRuntime === 'classic' ? { useSpread: true } : {}),
        },
      ],
      isTypeScriptEnabled && require('@babel/preset-typescript').default,
    ].filter(Boolean),
    plugins: [
      isFlowEnabled && [
        require('@babel/plugin-transform-flow-strip-types').default,
        false,
      ],
      require('babel-plugin-macros'),
      isTypeScriptEnabled && [
        require('@babel/plugin-proposal-decorators').default,
        false,
      ],
      require('@babel/plugin-transform-class-properties').default,
      require('@babel/plugin-transform-private-methods').default,
      require('@babel/plugin-transform-private-property-in-object').default,
      require('@babel/plugin-transform-numeric-separator').default,
      [
        require('@babel/plugin-transform-runtime').default,
        {
          absoluteRuntime: absoluteRuntimePath,
        },
      ],
      isEnvProduction && [
        require('babel-plugin-transform-react-remove-prop-types').default,
        { removeImport: true },
      ],
    ].filter(Boolean),
    overrides: [
      isFlowEnabled && {
        exclude: /\.tsx?$/,
        plugins: [require('@babel/plugin-transform-flow-strip-types').default],
      },
      isTypeScriptEnabled && {
        test: /\.tsx?$/,
        plugins: [
          [require('@babel/plugin-proposal-decorators').default, { version: 'legacy' }],
        ],
      },
    ].filter(Boolean),
  };
};
