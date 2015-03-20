'use strict';

var fs = require('fs')
  , path = require('path')
  , cli = require('prostore.api-client');

module.exports = function() {
  var dir = process.cwd();
  var text = fs.readFileSync(path.join(dir, 'prostore.json'));
  return cli.getClient(JSON.parse(text));
};
