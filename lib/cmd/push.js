'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
  , colors = require('colors')
  , path = require('path')
  , glob = require('prostore.glob-utils')
  , git = require('../git');

module.exports = exports = function (opts) {
  git.runInClean(opts, function () {
    var client = new Client(opts);
    var cwd = opts.cwd || process.cwd();
    var stats = {
      pushed: 0,
      skipped: 0,
      removed: 0,
      failed: 0
    };

    // Fetch remote and local file lists and diff'em

    async.parallel([
      function (cb) { glob(cwd, '**/*', cb); },
      function (cb) { client.get('storage', cb); }
    ], function (err, results) {
      if (err) return done(err);
      var localFiles = results[0]
        , remoteFiles = results[1]
        , queries = [];
      var diff = glob.diff(localFiles, remoteFiles);

      // Process files missing locally

      var missingFiles = diff.local.missing;
      if (missingFiles.length) {
        if (opts.remove) {
          missingFiles.forEach(function (file) {
            queries.push(function (cb) {
              client.delete('storage/' + file.path, function (err) {
                if (err) return cb(err);
                console.log('%s %s', colors.red('D'), file.path);
                stats.removed += 1;
                cb();
              });
            });
          });
        } else {
          console.log('\nСледующих файлов нет в локальной версии:\n');
          missingFiles.forEach(function (file) {
            console.log('%s %s', colors.gray('-'), file.path);
          });
          console.log('\nИспользуйте %s, чтобы удалить их с сервера, ' +
              'либо загрузите их в локальную версию с помощью %s\n',
            colors.red('--remove'),
            colors.yellow('prostore pull'));
        }
      }

      // Print files updated on remote which are not overwritten by push

      if (!opts.force && diff.updated.length) {
        console.log('\nСледующие файлы не будут отправлены, ' +
          'т.к. имеют более позднюю дату модификации на сервере:\n');
        diff.updated.forEach(function (file) {
          console.log('%s %s', colors.gray('-'), file.path);
        });
        console.log('\nИспользуйте %s, чтобы перезаписать их файлами из локальной версии, ' +
            'либо загрузите их с сервера с помощью %s.\n',
          colors.red('--force'),
          colors.yellow('prostore pull'));
      }

      // Collect files to push to remote

      var files = opts.force ? diff.modified : diff.local.newer;
      stats.skipped = localFiles.length - files.length;
      files.forEach(function (file) {
        queries.push(function (cb) {
          var request = client.request('post', 'storage/' + file.path);
          request({
            formData: {
              file: fs.createReadStream(path.resolve(cwd, file.path))
            }
          }, function (err, res) {
            if (err) return cb(err);
            if (res.statusCode != 200) {
              console.error('%s %s %s',
                colors.red('✘'),
                file.path,
                colors.gray(res.statusCode));
              stats.failed += 1;
              return cb();
            }
            console.log('%s %s', colors.green('✔'), file.path);
            stats.pushed += 1;
            cb();
          });
        });
      });

      // Run async tasks

      async.series(queries, function (err) {
        if (err) return done(err);
        console.log('\n-------------');
        console.log('prostore push');
        console.log('-------------');
        console.log('отправлено  %s', colors.green(stats.pushed));
        console.log('удалено     %s', colors.red(stats.removed));
        console.log('пропущено   %s', colors.gray(stats.skipped));
        if (stats.failed)
          console.log('ошибки      %s', colors.red(stats.failed));
        console.log('-------------\n');
        done();
      });
    });
  });
};

