'use strict';

var Client = require('prostore.rest-client');

module.exports = function(options) {
  var url = require('./locals')(options).url;
  if (!url)
    throw new Error('ProStore URL не указан.\n' +
      'Убедитесь, что `prostore.json` содержит `url`.');
  var creds = require('./credentials')(options)[url];
  if (!creds)
    throw new Error('Ошибка аутентификации. Запустите `prostore login`.');
  return new Client({
    url: url,
    userId: creds.userId,
    privateToken: creds.privateToken
  });
};
