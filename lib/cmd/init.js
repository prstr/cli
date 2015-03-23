'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , utils = require('../utils')
  , done = require('../done')
  , prompt = require('prompt');

module.exports = exports = function(opts) {
  var dir = process.cwd();
  fs.readdir(dir, function(err, files) {
    if (err) return done(err);
    if (files.indexOf('prostore.json') > -1)
      return done(new Error('prostore.json already exists. Exiting.'));
    prompt.message = 'init';
    prompt.start();
    prompt.get([
      {
        name: 'id',
        description: 'Store ID',
        required: true
      },
      {
        name: 'host',
        description: 'Store Host',
        required: true
      },
      {
        name: 'publicKey',
        description: 'Public Key',
        required: true
      },
      {
        name: 'privateKey',
        description: 'Private Key (input is hidden)',
        required: true,
        hidden: true
      }
    ], function(err, results) {
      if (err) return done(err);
      results.host = results.host.replace(/^.*:\/\//, '').replace(/\/.*/g, '');
      var templates = path.join(__dirname, '../../template');
      fs.copy(templates, dir, function(err) {
        if (err) return done(err);
        utils.compileFile(templates + '/prostore.json', dir + '/prostore.json', results, done)
      });
    });
  });

};
