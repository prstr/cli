'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , homedir = require('homedir');

/**
 * Reads credentials data needed for API authentication.
 *
 * @param {object} options
 * @param {string} options.file - credentials file, defaults to `$HOME/.prostore`
 * @returns {object} credentials object or {}
 * @module credentials
 */
module.exports = function(options) {
  options = options || {};
  var file = options.file || path.resolve(homedir(), '.prostore');
  try {
    return fs.readJsonFileSync(file, 'utf-8');
  } catch (e) {
    console.error('Не удалось прочитать данные аутентификации из %s', file);
    return {};
  }
};
