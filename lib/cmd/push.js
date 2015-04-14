'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
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
    var cRemoved = 0
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0
      , queries = [];
    var diff = glob.diff(results[1], results[0]);
    if (diff.removed.length) {
      if (opts.remove) {
        diff.removed.forEach(function(file) {
          queries.push(function(cb) {
            client.delete('/admin/storage/' + file.path, function(err) {
              /* istanbul ignore if */
              if (err) return cb(err);
              console.log('%s %s', colors.red('D'), file.path);
              cRemoved += 1;
              cb();
            });
          });
        });
      } else {
        console.log('%s file(s) no longer exist locally; ' +
            'use --remove to remove them from server',
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
        var request = client.request('post', '/admin/storage/' + file.path);
        var r = request({}, function(err, res, body) {
          /* istanbul ignore if */
          if (err) return cb(err);
          if (res.statusCode != 200) {
            console.error('%s %s %s',
              colors.red('✘'),
              file.path,
              colors.blackBright(res.statusCode));
            cFailed += 1;
            return cb();
          }
          console.log('%s %s', colors.green('✔'), file.path);
          cSuccess += 1;
          cb();
        });
        var form = r.form();
        form.append('file', fs.createReadStream(path.resolve(cwd, file.path)));
      });
    });
    async.series(queries, function(err) {
      /* istanbul ignore if */
      if (err) return done(err);
      console.log('Push done:');
      console.log('\t%s pushed', colors.green(cSuccess));
      console.log('\t%s removed', colors.red(cRemoved));
      console.log('\t%s skipped', colors.blackBright(cSkipped));
      if (cFailed)
        console.log('\t%s failed', colors.red(cFailed));
      done();
    });
  });
};

