"use strict";

var fs = require('fs-extra')
  , path = require('path')
  , homedir = require('homedir');

/**
 * Reads credentials data needed for API authentication.
 *
 * @param {object} options
 * @param {string} options.file - credentials file, defaults to `$HOME/.prostore`
 * @param {string} options.verbose - print debug messages if true
 * @returns {object} credentials object or {}
 * @module credentials
 */
module.exports = function(options) {
  options = options || {};
  var file = options.file || path.resolve(homedir(), '.prostore');
  if (options.verbose)
    console.log('Reading credentials from %s', file);
  try {
    return fs.readJsonFileSync(file, 'utf-8');
  } catch (e) {
    console.error('Couldn\'t read credentials from %s', file);
    return {};
  }
};
