'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , request = require('request')
  , done = require('../done')
  , prompt = require('prompt')
  , async = require('async')
  , sha256 = require('sha256')
  , homedir = require('homedir');

module.exports = exports = function(opts) {
  var locals = require('../locals')(opts);
  var url = (opts.url || locals.url).replace(/\/+$/g, '');
  if (!/https?:\/\/\S+/g.test(url))
    return done(new Error('URL must start with http:// or https://'));
  prompt.message = 'Login';
  var schema = {
    properties: {
      email: {
        description: 'Email',
        required: true
      },
      password: {
        description: 'Password',
        hidden: true,
        required: true
      }
    }
  };
  prompt.start();
  prompt.get(schema, function(err, results) {
    if (err) return done(err);
    request({
      url: url + '/api/login',
      method: 'get',
      json: true,
      qs: {
        email: results.email,
        passwordSha256: sha256(results.password),
        storeId: results.storeId
      }
    }, function(err, res, body) {
      if (err) return done(err);
      if (res.statusCode == 404)
        return done(new Error('Incorrect email or password.'));
      var credentialsFile = path.join(homedir(), '.prostore');
      fs.readJsonFile(credentialsFile, 'utf-8', function(err, loginData) {
        loginData = loginData || {};
        loginData[url] = {
          userId: body.userId,
          privateToken: body.privateToken
        };
        var queries = [];
        queries.push(function(cb) {
          fs.outputFile(credentialsFile,
            JSON.stringify(loginData, null, 2), 'utf-8', cb);
        });
        queries.push(function(cb) {
          fs.outputFile(path.join(process.cwd(), 'prostore.json'),
            JSON.stringify({ url: url }, null, 2), 'utf-8', cb);
        });
        async.parallel(queries, done);
      });
    });
  });
};
