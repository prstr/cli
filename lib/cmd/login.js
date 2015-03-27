'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , request = require('request')
  , done = require('../done')
  , prompt = require('prompt')
  , async = require('async')
  , sha256 = require('sha256');

module.exports = exports = function(opts) {
  var dir = process.cwd()
    , homedir = (process.platform == 'win32') ? process.env.HOMEPATH : process.env.HOME;
  prompt.message = 'Login';
  var schema = {
    properties: {}
  };
  schema.properties.storeId = {
    description: 'Store ID',
    required: true
  };
  schema.properties.storeUrl = {
    description: 'Store URL',
    required: true
  };
  schema.properties.email = {
    description: 'Email',
    required: true
  };
  schema.properties.password = {
    description: 'Password',
    hidden: true,
    required: true
  };
  prompt.start();
  prompt.get(schema, function(err, results) {
    if (err) return done(err);
    var loginFile = path.join(homedir, '.prostore')
      , loginData = fs.readJsonSync(loginFile, 'utf-8') || {}
      , queries = [];
    var options = {
      url: results.storeUrl + '/api/login',
      method: 'POST',
      form: {
        email: results.email,
        passwordSha256: sha256(results.password),
        storeId: results.storeId
      }
    };
    request(options, function(err, res, body) {
      if (err) return done(err);
      if (res.statusCode == 404) return done(new Error('User nor authorized'));
      loginData[results.storeId] = {
        url: results.storeUrl,
        userId: JSON.parse(body).userId,
        privateToken: sha256(results.password)
      };
      var queries = [];
      queries.push(function(cb) {
        fs.outputFile(
          loginFile,
          JSON.stringify(loginData, null, 2),
          { encoding: 'utf-8' },
          cb);
      });
      queries.push(function(cb) {
        fs.outputFile(
          process.cwd() + '/prostore.json',
          JSON.stringify({url: results.storeUrl}, null, 2),
          { encoding: 'utf-8' },
          cb);
      });
      async.parallel(queries, done);
    });
  });
};
