'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , homedir = require('homedir')
  , Client = require('prostore.api-client');

module.exports = function() {
  try {
    var data = fs.readJsonFileSync(path.join(process.cwd(), 'prostore.json'))
      , credentials = fs.readJsonFileSync(path.join(homedir(), '.prostore'));
    return new Client({
      url: data.url,
      userId: credentials[data.url].userId,
      privateToken: credentials[data.url].privateToken
    });
  } catch(e) {
    console.error('prostore.json or ~/.prostore not found. Try running inside ProStore project.');
    process.exit(1);
  }
};
