'use strict';

var fs = require('fs')
  , path = require('path')
  , Client = require('prostore.api-client');

module.exports = function() {
  try {
    return new Client(
      JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'prostore.json'))));
  } catch(e) {
    console.error('prostore.json not found. Try running inside ProStore project.');
    process.exit(1);
  }
};
