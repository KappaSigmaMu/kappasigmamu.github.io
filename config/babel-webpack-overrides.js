'use strict';

const crypto = require('crypto');

const macroCheck = new RegExp('[./]macro');

module.exports = function () {
  return {
    config(config, { source }) {
      if (macroCheck.test(source)) {
        return Object.assign({}, config.options, {
          caller: Object.assign({}, config.options.caller, {
            craInvalidationToken: crypto.randomBytes(32).toString('hex'),
          }),
        });
      }
      return config.options;
    },
  };
};
