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
      console.log('\nОтсутствуют локально');
      console.log('(%s — удалить с сервера, %s — загрузить с сервера)\n',
        colors.red('prostore push --remove'),
        colors.yellow('prostore pull'));
      diff.local.missing.forEach(function(file, i) {
        console.log('\t%s %s', colors.gray('-'), file.path);
      });
    }

    if (diff.remote.missing.length) {
      console.log('\nОтсутствуют на сервере');
      console.log('(%s — удалить локально, %s — отправить на сервер)\n',
        colors.red('prostore pull --remove'),
        colors.yellow('prostore push'));
      diff.remote.missing.forEach(function(file, i) {
        console.log('\t%s %s', colors.gray('-'), file.path);
      });
    }

    if (diff.dirty.length) {
      console.log('\nИзменены локально');
      console.log('(%s — отправить на сервер)\n',
        colors.yellow('prostore push'));
      diff.dirty.forEach(function(file, i) {
        console.log('\t%s %s', colors.gray('-'), file.path);
      });
    }

    if (diff.updated.length) {
      console.log('\nИзменены на сервере');
      console.log('(%s — загрузить с сервера)\n',
        colors.yellow('prostore pull'));
      diff.updated.forEach(function(file, i) {
        console.log('\t%s %s', colors.gray('-'), file.path);
      });
    }

    if (diff.added.length + diff.removed.length + diff.modified.length == 0)
      console.log('\nПроект синхронизирован с сервером.');

    console.log('');
    done();
  });
};

