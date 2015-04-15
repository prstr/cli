'use strict';

var Client = require('prostore.rest-client');

module.exports = function(options) {
  var url = require('./locals')(options).url;
  if (!url)
    throw new Error('ProStore URL not specified.\n' +
      'Make sure `prostore.json` contains valid `url`.');
  var creds = require('./credentials')(options)[url];
  if (!creds)
    throw new Error('Auth credentials not found. Run `prostore login`.');
  return new Client({
    url: url,
    userId: creds.userId,
    privateToken: creds.privateToken
  });
};
