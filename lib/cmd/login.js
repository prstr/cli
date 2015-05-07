'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , request = require('request')
  , done = require('../done')
  , prompt = require('prompt')
  , async = require('async')
  , createHash = require('sha.js')
  , homedir = require('homedir')
  , colors = require('colors');

module.exports = exports = function (opts) {
  var locals = require('../locals')(opts);
  var cwd = opts.cwd || process.cwd();
  var url = (opts.url || locals.url).replace(/\/+$/g, '');
  if (!/https?:\/\/\S+/g.test(url))
    return done(new Error('URL должен начинаться с http:// или https://'));
  prompt.message = 'Login';
  var schema = {
    properties: {
      email: {
        description: 'Email',
        required: true
      },
      password: {
        description: 'Пароль',
        hidden: true,
        required: true
      }
    }
  };
  prompt.start();
  prompt.get(schema, function (err, results) {
    if (err) return done(err);
    request({
      url: url + '/api/login',
      method: 'get',
      json: true,
      qs: {
        email: results.email,
        passwordSha256: createHash('sha256')
          .update(results.password, 'utf-8')
          .digest('hex'),
        storeId: results.storeId
      }
    }, function (err, res, body) {
      if (err) return done(err);
      var user = body && body.user || {};
      if (!user._id)
        return done(new Error('Ошибка входа, попробуйте еще раз.'));
      var credentialsFile = path.join(homedir(), '.prostore');
      fs.readJsonFile(credentialsFile, 'utf-8', function (ignoredErr, loginData) {
        loginData = loginData || {};
        loginData[url] = {
          userId: body.user._id,
          privateToken: body.privateToken
        };
        var queries = [];
        queries.push(function (cb) {
          fs.outputFile(credentialsFile,
            JSON.stringify(loginData, null, 2), 'utf-8', cb);
        });
        queries.push(function (cb) {
          fs.outputFile(path.join(cwd, 'prostore.json'),
            JSON.stringify({ url: url }, null, 2), 'utf-8', cb);
        });
        async.parallel(queries, function (err) {
          if (err) return done(err);
          console.log('Добро пожаловать, %s %s!',
            colors.yellow(user.firstName),
            colors.yellow(user.secondName));
        });
      });
    });
  });
};
