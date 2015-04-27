'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , colors = require('colors')
  , path = require('path')
  , glob = require('prostore.glob-utils')
  , git = require('../git');

module.exports = exports = function(opts) {
  var client = new Client(opts);
  var cwd = opts.cwd || process.cwd();

  async.parallel([
    function(cb) {
      client.get('admin/storage', cb)
    },
    function(cb) {
      glob(cwd, '**/*', cb)
    }
  ], function(err, results) {
    if (err) return done(err);
    var diff = glob.diff(results[1], results[0]);

    if (diff.local.missing.length) {
      console.log('\nОтсутствуют в локальной версии:\n');
      diff.local.missing.forEach(function(file, i) {
        console.log('%s %s', colors.gray(i + 1), file.path);
      });
    }

    if (diff.remote.missing.length) {
      console.log('\nОтсутствуют на сервере:\n');
      diff.remote.missing.forEach(function(file, i) {
        console.log('%s %s', colors.gray(i + 1), file.path);
      });
    }

    if (diff.dirty.length) {
      console.log('\nБолее позднее изменение в локальной версии:\n');
      diff.dirty.forEach(function(file, i) {
        console.log('%s %s', colors.gray(i + 1), file.path);
      });
    }

    if (diff.updated.length) {
      console.log('\nБолее позднее изменение на сервере:\n');
      diff.updated.forEach(function(file, i) {
        console.log('%s %s', colors.gray(i + 1), file.path);
      });
    }

    if (diff.added.length + diff.removed.length + diff.modified.length == 0)
      console.log('\nПроект синхронизирован с сервером.');

    console.log('');
    done();
  });
};

