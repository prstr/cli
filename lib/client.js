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
    console.error('Can not find configurations. Please check file "prostore.json", in working directory and file ".prostore" in your home directory. Use "prostore login" command if files are not exist.');
    process.exit(1);
  }
};
