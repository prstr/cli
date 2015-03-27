'use strict';

var fs = require('fs')
  , path = require('path')
  , _ = require('underscore')
  , Client = require('prostore.api-client');

module.exports = function() {
  var homedir = (process.platform == 'win32') ? process.env.HOMEPATH : process.env.HOME
    , storeUrl = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'prostore.json'))
    ).url;
  try {
    return new Client(
      _(JSON.parse(fs.readFileSync(path.join(homedir, '.prostore')))).findWhere({ url: storeUrl}));
  } catch(e) {
    console.error('prostore.json or ~/.prostore not found. Try running inside ProStore project.');
    process.exit(1);
  }
};
