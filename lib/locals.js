"use strict";

var fs = require('fs-extra')
  , path = require('path');

/**
 * Reads data from `prostore.json` located in process `cwd`.
 *
 * @param {object} options
 * @param {string} options.file - override default file
 * @returns {object} data or empty object if file does not exist
 * @module locals
 */
module.exports = function(options) {
  options = options || {};
  var file = options.file || path.resolve(process.cwd(), 'prostore.json');
  try {
    return fs.readJsonFileSync(file, 'utf-8') || {};
  } catch (e) {
    if (options.verbose)
      console.log('Couldn\'t read locals from %s', file);
    return {};
  }
};
