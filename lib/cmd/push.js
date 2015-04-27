'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
  , colors = require('colors')
  , path = require('path')
  , glob = require('prostore.glob-utils')
  , git = require('../git');

module.exports = exports = function(opts) {
  git.runInCleanGit(opts, function() {
    var client = new Client(opts);
    var cwd = opts.cwd || process.cwd();
    async.parallel([
      function(cb) { client.get('admin/storage', cb) },
      function(cb) { glob(cwd, '**/*', cb) }
    ], function(err, results) {
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
                if (err) return cb(err);
                console.log('%s %s', colors.red('D'), file.path);
                cRemoved += 1;
                cb();
              });
            });
          });
        } else {
          console.log('%s файл(ов) нет в локальной версии; ' +
              'используйте --remove, чтобы удалить их с сервера',
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
            if (err) return cb(err);
            if (res.statusCode != 200) {
              console.error('%s %s %s',
                colors.red('✘'),
                file.path,
                colors.gray(res.statusCode));
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
        if (err) return done(err);
        console.log('prostore push:');
        console.log('\t%s загружено', colors.green(cSuccess));
        console.log('\t%s удалено', colors.red(cRemoved));
        console.log('\t%s пропущено', colors.gray(cSkipped));
        if (cFailed)
          console.log('\t%s ошибок', colors.red(cFailed));
        done();
      });
    });
  });
};

