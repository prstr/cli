'use strict';

var Client = require('../client')()
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
  , colors = require('cli-color')
  , path = require('path')
  , glob = require('glob')
  , _ = require('underscore');

module.exports = exports = function(opts) {
  var force = opts.force
    , remove = opts.remove;
  Client.getJSON('cli/pull', {}, function(err, res) {
    if (err) return done(err);
    var files = res.body
      , cRemoved = 0
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0
      , queries = [];

    if (remove) {
      queries.push(function(cb) {
        var filenames = _(files).map(function(file) {
          return file.filename;
        });
        var templatesPath = path.join(process.cwd(), 'templates');
        var staticPath = path.join(process.cwd(), 'static');
        glob(process.cwd() + '/+(templates|static)/**/*.*', function(err, files) {
          /* istanbul ignore if */
          if (err) return cb(err);
          async.each(files, function(file, cb) {
            /* istanbul ignore if */
            if (filenames.indexOf(file.replace(process.cwd(), '')) > -1) return cb();
            cRemoved += 1;
            fs.remove(file, cb);
          }, cb)
        })
      });
    }

    queries.push(function(cb) {
      async.each(files, function(file, cb) {
        fs.stat(path.join(process.cwd(), file.filename), function(err, stat) {
          var skip = !force && stat && file.mtime && stat.mtime.getTime() > file.mtime;
          if (skip) {
            cSkipped += 1;
            return cb();
          }
          var request = Client.request('get', '/cli/pull' + file.filename);
          request({ encoding: null }, function(err, res, body) {
            /* istanbul ignore if */
            if (err) return cb(err);
            if (res.statusCode != 200) {
              // Report failure and skip
              console.error('%s %s %s',
                colors.red('✘'),
                file.filename,
                colors.blackBright(res.statusCode));
              cFailed += 1;
              return cb();
            }
            fs.outputFile(path.join(process.cwd(), file.filename), body, function(err) {
              if (err) return cb(err);
              console.log('%s %s', colors.green('✔'), file.filename);
              cSuccess += 1;
              cb();
            });
          });
        });
      }, cb)
    });

    async.parallel(queries, function(err) {
      /* istanbul ignore if */
      if (err) return done(err);
      console.log('Pull done:');
      console.log('\t%s file(s) pulled', colors.green(cSuccess));
      console.log('\t%s files removed', colors.blackBright(cRemoved));
      console.log('\t%s errors', colors.red(cFailed));
      console.log('\t%s files skipped', colors.blackBright(cSkipped));
      done();
    })
  });
};

