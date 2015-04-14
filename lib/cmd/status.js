'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , colors = require('cli-color')
  , path = require('path')
  , glob = require('prostore.glob-utils');

module.exports = exports = function(opts) {
  var client = new Client(opts);
  var cwd = opts.dir || process.cwd();
  async.parallel([
    function(cb) { client.get('admin/storage', cb) },
    function(cb) { glob(cwd, '**/*', cb) }
  ], function(err, results) {
    /* istanbul ignore if */
    if (err) return done(err);
    var diff = glob.diff(results[1], results[0]);
    if (diff.added.length) {
      console.log('%s file(s) added', colors.green(diff.added.length));
      diff.added.forEach(function(file) {
        console.log('\t%s', file.path);
      });
    }
    if (diff.removed.length) {
      console.log('%s file(s) removed', colors.red(diff.removed.length));
      diff.removed.forEach(function(file) {
        console.log('\t%s', file.path);
      });
    }
    if (diff.modified.length) {
      console.log('%s file(s) modified', colors.yellow(diff.modified.length));
      diff.modified.forEach(function(file) {
        console.log('\t%s', file.path);
      });
    }
    if (diff.added.length + diff.removed.length + diff.modified.length == 0)
      console.log('This project is up-to-date with server.');
    done();
  });
};

