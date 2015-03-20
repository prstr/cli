'use strict';

var fs = require('fs')
  , path = require('path')
  , Client = require('prostore.api-client');

module.exports = function() {
  var dir = process.cwd();
  var text = fs.readFileSync(path.join(dir, 'prostore.json'));
  return new Client(JSON.parse(text));
};
