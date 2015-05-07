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
  git.runInClean(opts, function() {
    var client = new Client(opts);
    var cwd = opts.cwd || process.cwd();
    var targetDir = opts.theme ? path.join(cwd, 'themes', opts.theme) : cwd;
    var queries = [
      function(cb) { glob(targetDir, '**/*', cb); }
    ];
    if (opts.theme) {
      queries.push(function(cb) { client.get('admin/themes/' + opts.theme, cb); });
    } else {
      queries.push(function(cb) { client.get('admin/storage', cb); });
    }
    var stats = {
      pulled: 0,
      skipped: 0,
      removed: 0,
      failed: 0
    };

    // Fetch local and remote file lists and diff'em

    async.parallel(queries, function(err, results) {
      if (err) return done(err);
      var localFiles = results[0];
      var remoteFiles = results[1];
      var queries = [];
      var diff = glob.diff(localFiles, remoteFiles);

      // Process files missing on remote

      var missingFiles = diff.remote.missing;
      if (missingFiles.length) {
        if (opts.remove) {
          missingFiles.forEach(function(file) {
            queries.push(function(cb) {
              fs.remove(path.resolve(targetDir, file.path), function(err) {
                if (err) return cb(err);
                console.log('%s %s', colors.red('D'), file.path);
                stats.removed += 1;
                cb();
              });
            });
          });
        } else {
          console.log('\nСледующих файлов нет на сервере:\n');
          missingFiles.forEach(function(file) {
            console.log('%s %s', colors.gray('-'), file.path);
          });
          console.log('\nИспользуйте %s, чтобы удалить их локально, ' +
              'либо отправьте их на сервер с помощью %s\n',
            colors.red('--remove'),
            colors.yellow('prostore push'));
        }
      }

      // Print dirty files which are not overwritten by pull

      if (!opts.force && diff.dirty.length) {
        console.log('\nСледующие файлы не будут загружены, ' +
          'т.к. имеют более позднюю дату модификации в локальной версии:\n');
        diff.dirty.forEach(function(file) {
          console.log('%s %s', colors.gray('-'), file.path);
        });
        console.log('\nИспользуйте %s, чтобы перезаписать их файлами с сервера, ' +
            'либо отправьте их на сервер с помощью %s\n',
          colors.red('--force'),
          colors.yellow('prostore push'));
      }

      // Collect files to pull from remote

      var files = opts.force ? diff.modified : diff.remote.newer;
      stats.skipped = remoteFiles.length - files.length;
      files.forEach(function(file) {
        queries.push(function(cb) {
          var endpoint = opts.theme
            ? '/admin/themes/' + opts.theme + '/' + file.path
            : '/admin/storage/' + file.path;
          client.get(endpoint,
            { encoding: null, json: false },
            function(err, data) {
              if (err) {
                console.error('%s %s %s',
                  colors.red('✘'),
                  file.path,
                  colors.gray(err.message));
                stats.failed += 1;
                return cb();
              }
              fs.outputFile(path.resolve(targetDir, file.path), data, 'utf-8', function(err) {
                if (err) return cb(err);
                console.log('%s %s', colors.green('✔'), file.path);
                stats.pulled += 1;
                cb();
              });
            });
        });
      });

      // Run async tasks

      async.series(queries, function(err) {
        if (err) return done(err);
        console.log('\n-------------');
        console.log('prostore pull');
        console.log('-------------');
        console.log('загружено  %s', colors.green(stats.pulled));
        console.log('удалено    %s', colors.red(stats.removed));
        console.log('пропущено  %s', colors.gray(stats.skipped));
        if (stats.failed)
          console.log('ошибки     %s', colors.red(stats.failed));
        console.log('-------------\n');
        done();
      });
    });
  });
};

