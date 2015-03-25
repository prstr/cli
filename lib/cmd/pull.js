'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
  , colors = require('cli-color')
  , path = require('path')
  , glob = require('prostore.glob-utils');

module.exports = exports = function(opts) {
  var client = Client();
  var cwd = path.resolve(process.cwd(), 'store');
  async.parallel([
    function(cb) { client.get('admin/storage', cb) },
    function(cb) { glob(cwd, '**/*', cb) }
  ], function(err, results) {
    /* istanbul ignore if */
    if (err) return done(err);
    var cRemoved = 0
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0
      , queries = [];
    var diff = glob.diff(results[0], results[1]);
    if (diff.removed.length) {
      if (opts.remove) {
        diff.removed.forEach(function(file) {
          queries.push(function(cb) {
            fs.remove(path.resolve(cwd, file.path), function(err) {
              /* istanbul ignore if */
              if (err) return cb(err);
              console.log('%s %s', colors.red('D'), file.path);
              cRemoved += 1;
              cb();
            });
          });
        });
      } else {
        console.log('%s file(s) no longer exist on server; ' +
            'use --remove to remove them locally',
          colors.red(diff.removed.length));
      }
    }
    var files = diff.modified.concat(diff.added);
    if (opts.force)
      files = files.concat(diff.unmodified);
    else
      cSkipped = diff.unmodified.length;
    files.forEach(function(file) {
      queries.push(function(cb) {
        client.get('/admin/storage/' + file.path,
          { encoding: null, json: false },
          function(err, data) {
            /* istanbul ignore if */
            if (err) {
              console.error('%s %s %s',
                colors.red('✘'),
                file.path,
                colors.blackBright(res.statusCode));
              cFailed += 1;
              return cb();
            }
            fs.outputFile(path.resolve(cwd, file.path), data, 'utf-8', function(err) {
              /* istanbul ignore if */
              if (err) return cb(err);
              console.log('%s %s', colors.green('✔'), file.path);
              cSuccess += 1;
              cb();
            });
          });
      });
    });
    async.series(queries, function(err) {
      /* istanbul ignore if */
      if (err) return done(err);
      console.log('Pull done:');
      console.log('\t%s pulled', colors.green(cSuccess));
      console.log('\t%s removed', colors.red(cRemoved));
      console.log('\t%s skipped', colors.blackBright(cSkipped));
      if (cFailed)
        console.log('\t%s failed', colors.red(cFailed));
      done();
    });
  });
};

