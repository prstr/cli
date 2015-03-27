'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , homedir = require('homedir')
  , Client = require('prostore.api-client');

module.exports = function() {
  try {
    var data = fs.readJsonFileSync(path.join(process.cwd(), 'prostore.json'))
      , credentials = fs.readJsonFileSync(path.join(homedir(), '.prostore'));

    if (!data.url) return new Error('Not found url at "prostore.json" file in ProStore project directory.');
    if (!credentials[data.url]) return new Error('Not found data about user at ".prostore" file in your home directory.');
    return new Client({
      url: data.url,
      userId: credentials[data.url].userId,
      privateToken: credentials[data.url].privateToken
    });
  } catch(e) {
    switch (path.basename(e.path)){
      case 'prostore.json':
        console.log('Can not find "prostore.json" file in ProStore project directory.');
        process.exit(1);
      case '.prostore':
        console.log('Can not find ".prostore" file in your home directory.');
        process.exit(1);
      default:
        console.log(e);
        process.exit(1);
    }
  }
};
